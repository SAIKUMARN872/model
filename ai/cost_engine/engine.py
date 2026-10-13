from __future__ import annotations

from decimal import Decimal
from typing import Iterable, Optional

from .constants import DEFAULT_CURRENCY
from .interfaces import (
    CostCalculator,
    CostEngineInterface,
    CostTracker,
    PricingProvider,
    TokenUsageProvider,
)
from .models import CostRequest, CostResult, ModelPricing, TokenUsage
from .utils import calculate_token_cost, normalize_currency, round_cost


class DefaultCostCalculator(CostCalculator):
    """Default token-based cost calculator."""

    def calculate(
        self,
        request: CostRequest,
        pricing: ModelPricing,
    ) -> CostResult:
        input_cost = calculate_token_cost(
            request.usage.input_tokens,
            pricing.input_cost_per_1k_tokens,
        )

        output_cost = calculate_token_cost(
            request.usage.output_tokens,
            pricing.output_cost_per_1k_tokens,
        )

        total_cost = round_cost(input_cost + output_cost)

        return CostResult(
            model=request.model,
            provider=request.provider,
            input_tokens=request.usage.input_tokens,
            output_tokens=request.usage.output_tokens,
            total_tokens=request.usage.total_tokens,
            input_cost=round_cost(input_cost),
            output_cost=round_cost(output_cost),
            total_cost=total_cost,
            currency=normalize_currency(pricing.currency),
            request_id=request.request_id,
            metadata=dict(request.metadata),
        )


class InMemoryCostTracker(CostTracker):
    """Simple in-memory tracker for calculated costs."""

    def __init__(self) -> None:
        self._records: list[CostResult] = []

    def record(self, result: CostResult) -> None:
        self._records.append(result)

    def get_total_cost(
        self,
        model: Optional[str] = None,
        provider: Optional[str] = None,
    ) -> Decimal:
        total = Decimal("0")

        for record in self._records:
            if model is not None and record.model != model:
                continue

            if provider is not None and record.provider != provider:
                continue

            total += record.total_cost

        return round_cost(total)

    @property
    def records(self) -> tuple[CostResult, ...]:
        return tuple(self._records)


class StaticPricingProvider(PricingProvider):
    """Pricing provider backed by an in-memory pricing catalog."""

    def __init__(
        self,
        pricing: Iterable[ModelPricing] = (),
    ) -> None:
        self._pricing: dict[tuple[str, str], ModelPricing] = {}

        for item in pricing:
            self.register(item)

    def register(self, pricing: ModelPricing) -> None:
        key = (
            pricing.provider.strip().lower(),
            pricing.model.strip().lower(),
        )
        self._pricing[key] = pricing

    def get_pricing(
        self,
        model: str,
        provider: str,
    ) -> Optional[ModelPricing]:
        key = (
            provider.strip().lower(),
            model.strip().lower(),
        )
        return self._pricing.get(key)


class DefaultTokenUsageProvider(TokenUsageProvider):
    """Uses token usage already present in the CostRequest."""

    def get_usage(self, request: CostRequest) -> TokenUsage:
        return request.usage


class CostEngine(CostEngineInterface):
    """Central orchestration layer for ModelNow cost calculation."""

    def __init__(
        self,
        pricing_provider: PricingProvider,
        calculator: Optional[CostCalculator] = None,
        tracker: Optional[CostTracker] = None,
        usage_provider: Optional[TokenUsageProvider] = None,
    ) -> None:
        self.pricing_provider = pricing_provider
        self.calculator = calculator or DefaultCostCalculator()
        self.tracker = tracker or InMemoryCostTracker()
        self.usage_provider = usage_provider or DefaultTokenUsageProvider()

    def calculate_cost(self, request: CostRequest) -> CostResult:
        usage = self.usage_provider.get_usage(request)

        normalized_request = CostRequest(
            model=request.model,
            provider=request.provider,
            usage=usage,
            request_id=request.request_id,
            metadata=dict(request.metadata),
        )

        pricing = self.pricing_provider.get_pricing(
            normalized_request.model,
            normalized_request.provider,
        )

        if pricing is None:
            raise ValueError(
                "No pricing found for "
                f"model='{normalized_request.model}', "
                f"provider='{normalized_request.provider}'"
            )

        result = self.calculator.calculate(
            normalized_request,
            pricing,
        )

        self.tracker.record(result)

        return result

    def calculate_batch(
        self,
        requests: Iterable[CostRequest],
    ) -> list[CostResult]:
        return [
            self.calculate_cost(request)
            for request in requests
        ]

    def get_total_cost(
        self,
        model: Optional[str] = None,
        provider: Optional[str] = None,
    ) -> Decimal:
        return self.tracker.get_total_cost(
            model=model,
            provider=provider,
        )


def create_default_cost_engine() -> CostEngine:
    """Create a usable Cost Engine with an empty pricing catalog."""
    return CostEngine(
        pricing_provider=StaticPricingProvider(),
    )


__all__ = [
    "CostEngine",
    "DefaultCostCalculator",
    "DefaultTokenUsageProvider",
    "InMemoryCostTracker",
    "StaticPricingProvider",
    "create_default_cost_engine",
    "DEFAULT_CURRENCY",
]
