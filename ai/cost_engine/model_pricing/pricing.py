"""
Main model pricing service.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal
from threading import RLock
from typing import Any, Iterable

from .models import ModelPricing
from .pricing_rules import (
    PricingRule,
    PricingRuleEngine,
)
from .pricing_version import (
    PricingVersion,
    PricingVersionManager,
)


class ModelPricingNotFoundError(KeyError):
    """Raised when model pricing cannot be found."""


@dataclass(frozen=True)
class PriceCalculation:
    """Result of a pricing calculation."""

    model: str
    provider: str

    input_tokens: int
    output_tokens: int
    cached_input_tokens: int
    reasoning_tokens: int

    base_cost: Decimal
    adjusted_cost: Decimal

    currency: str
    pricing_version: str

    applied_rules: tuple[str, ...]

    @property
    def total_tokens(self) -> int:
        return (
            self.input_tokens
            + self.output_tokens
        )


class ModelPricingService:
    """
    Central pricing service for the Cost Engine.

    Responsibilities:

    - register model prices
    - retrieve active pricing
    - manage pricing versions
    - calculate request cost
    - apply pricing rules
    """

    def __init__(
        self,
        rule_engine: PricingRuleEngine | None = None,
        version_manager: PricingVersionManager | None = None,
    ) -> None:

        self.rule_engine = (
            rule_engine
            or PricingRuleEngine()
        )

        self.version_manager = (
            version_manager
            or PricingVersionManager()
        )

        self._pricing: dict[
            tuple[str, str, str],
            ModelPricing,
        ] = {}

        self._lock = RLock()

    def register(
        self,
        pricing: ModelPricing,
    ) -> ModelPricing:

        key = self._key(
            pricing.provider,
            pricing.model,
            pricing.version,
        )

        with self._lock:
            self._pricing[key] = pricing

        return pricing

    def register_many(
        self,
        pricing_list: Iterable[ModelPricing],
    ) -> None:

        for pricing in pricing_list:
            self.register(pricing)

    def get(
        self,
        model: str,
        provider: str,
        version: str | None = None,
        at: datetime | None = None,
    ) -> ModelPricing:

        at = at or datetime.now(timezone.utc)

        with self._lock:

            candidates = [
                pricing
                for (
                    p,
                    m,
                    v,
                ), pricing in self._pricing.items()
                if p.lower() == provider.lower()
                and m.lower() == model.lower()
                and (
                    version is None
                    or v == version
                )
            ]

        active = [
            pricing
            for pricing in candidates
            if pricing.is_active(at)
        ]

        if not active:
            raise ModelPricingNotFoundError(
                "No active pricing found for "
                f"provider={provider}, "
                f"model={model}, "
                f"version={version}"
            )

        active.sort(
            key=lambda item: item.effective_from,
            reverse=True,
        )

        return active[0]

    def get_or_none(
        self,
        model: str,
        provider: str,
        version: str | None = None,
        at: datetime | None = None,
    ) -> ModelPricing | None:

        try:
            return self.get(
                model=model,
                provider=provider,
                version=version,
                at=at,
            )
        except ModelPricingNotFoundError:
            return None

    def calculate(
        self,
        model: str,
        provider: str,
        input_tokens: int = 0,
        output_tokens: int = 0,
        cached_input_tokens: int = 0,
        reasoning_tokens: int = 0,
        version: str | None = None,
        at: datetime | None = None,
        apply_rules: bool = True,
    ) -> PriceCalculation:

        pricing = self.get(
            model=model,
            provider=provider,
            version=version,
            at=at,
        )

        base_cost = pricing.calculate_cost(
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cached_input_tokens=cached_input_tokens,
            reasoning_tokens=reasoning_tokens,
        )

        applied_rules: list[str] = []

        adjusted_cost = base_cost

        if apply_rules:

            rules = self.rule_engine.matching_rules(
                pricing
            )

            for rule in rules:
                adjusted_cost = rule.apply(
                    adjusted_cost
                )

                applied_rules.append(
                    rule.name
                )

        return PriceCalculation(
            model=pricing.model,
            provider=pricing.provider,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cached_input_tokens=cached_input_tokens,
            reasoning_tokens=reasoning_tokens,
            base_cost=base_cost,
            adjusted_cost=adjusted_cost,
            currency=pricing.currency,
            pricing_version=pricing.version,
            applied_rules=tuple(
                applied_rules
            ),
        )

    def add_rule(
        self,
        rule: PricingRule,
    ) -> None:

        self.rule_engine.add_rule(
            rule
        )

    def register_version(
        self,
        version: PricingVersion,
    ) -> PricingVersion:

        return self.version_manager.register(
            version
        )

    def activate_version(
        self,
        version: str,
    ) -> PricingVersion:

        return self.version_manager.activate(
            version
        )

    def active_version(
        self,
    ) -> PricingVersion | None:

        return self.version_manager.active_version

    def all_pricing(
        self,
    ) -> list[ModelPricing]:

        with self._lock:
            return list(
                self._pricing.values()
            )

    def models(
        self,
        provider: str | None = None,
    ) -> list[str]:

        with self._lock:

            result = set()

            for (
                pricing_provider,
                model,
                _version,
            ) in self._pricing.keys():

                if (
                    provider is not None
                    and pricing_provider.lower()
                    != provider.lower()
                ):
                    continue

                result.add(model)

            return sorted(result)

    def providers(
        self,
    ) -> list[str]:

        with self._lock:

            result = {
                provider
                for (
                    provider,
                    _model,
                    _version,
                ) in self._pricing.keys()
            }

            return sorted(result)

    def remove(
        self,
        model: str,
        provider: str,
        version: str,
    ) -> bool:

        key = self._key(
            provider,
            model,
            version,
        )

        with self._lock:

            if key not in self._pricing:
                return False

            del self._pricing[key]

            return True

    @staticmethod
    def _key(
        provider: str,
        model: str,
        version: str,
    ) -> tuple[str, str, str]:

        return (
            provider.strip().lower(),
            model.strip().lower(),
            version.strip(),
        )