"""
Pricing rules and pricing adjustments.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any, Dict, Iterable

from .models import ModelPricing


class PricingRuleError(ValueError):
    """Raised when a pricing rule is invalid."""


@dataclass(frozen=True)
class PricingRule:
    """
    A pricing adjustment rule.

    discount_percent:
        Reduces the calculated price.

    markup_percent:
        Increases the calculated price.

    minimum_cost:
        Minimum amount charged.

    maximum_cost:
        Maximum amount charged.
    """

    name: str

    discount_percent: Decimal = Decimal("0")
    markup_percent: Decimal = Decimal("0")

    minimum_cost: Decimal | None = None
    maximum_cost: Decimal | None = None

    provider: str | None = None
    model: str | None = None

    priority: int = 100

    enabled: bool = True

    metadata: Dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        if not self.name:
            raise PricingRuleError(
                "Rule name cannot be empty"
            )

        if self.discount_percent < 0:
            raise PricingRuleError(
                "discount_percent cannot be negative"
            )

        if self.discount_percent > 100:
            raise PricingRuleError(
                "discount_percent cannot exceed 100"
            )

        if self.markup_percent < 0:
            raise PricingRuleError(
                "markup_percent cannot be negative"
            )

        if (
            self.minimum_cost is not None
            and self.minimum_cost < 0
        ):
            raise PricingRuleError(
                "minimum_cost cannot be negative"
            )

        if (
            self.maximum_cost is not None
            and self.maximum_cost < 0
        ):
            raise PricingRuleError(
                "maximum_cost cannot be negative"
            )

        if (
            self.minimum_cost is not None
            and self.maximum_cost is not None
            and self.minimum_cost > self.maximum_cost
        ):
            raise PricingRuleError(
                "minimum_cost cannot exceed maximum_cost"
            )

    def matches(
        self,
        pricing: ModelPricing,
    ) -> bool:

        if (
            self.provider is not None
            and self.provider.lower()
            != pricing.provider.lower()
        ):
            return False

        if (
            self.model is not None
            and self.model.lower()
            != pricing.model.lower()
        ):
            return False

        return True

    def apply(
        self,
        amount: Decimal,
    ) -> Decimal:

        result = Decimal(str(amount))

        if self.discount_percent:
            result *= (
                Decimal("1")
                - self.discount_percent
                / Decimal("100")
            )

        if self.markup_percent:
            result *= (
                Decimal("1")
                + self.markup_percent
                / Decimal("100")
            )

        if self.minimum_cost is not None:
            result = max(
                result,
                self.minimum_cost,
            )

        if self.maximum_cost is not None:
            result = min(
                result,
                self.maximum_cost,
            )

        return result


class PricingRuleEngine:
    """
    Applies matching pricing rules.
    """

    def __init__(
        self,
        rules: Iterable[PricingRule] | None = None,
    ) -> None:

        self._rules: list[PricingRule] = list(
            rules or []
        )

    def add_rule(
        self,
        rule: PricingRule,
    ) -> None:

        self._rules.append(rule)

        self._rules.sort(
            key=lambda item: item.priority
        )

    def remove_rule(
        self,
        name: str,
    ) -> None:

        self._rules = [
            rule
            for rule in self._rules
            if rule.name != name
        ]

    def matching_rules(
        self,
        pricing: ModelPricing,
    ) -> list[PricingRule]:

        return [
            rule
            for rule in self._rules
            if rule.enabled
            and rule.matches(pricing)
        ]

    def apply(
        self,
        pricing: ModelPricing,
        amount: Decimal,
    ) -> Decimal:

        result = Decimal(str(amount))

        for rule in self.matching_rules(pricing):
            result = rule.apply(result)

        return result

    def all_rules(
        self,
    ) -> list[PricingRule]:

        return list(self._rules)