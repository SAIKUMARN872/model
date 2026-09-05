from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterable, Mapping

from .calculator import (
    CostCalculation,
    CostCalculator,
)
from .pricing_cache import (
    ModelPricing,
    PricingCache,
)
from .token_counter import (
    TokenCounter,
)


@dataclass(frozen=True)
class CostEstimate:
    """Complete estimated request cost."""

    model: str
    input_tokens: int
    output_tokens: int
    total_tokens: int

    input_cost: str
    output_cost: str
    total_cost: str

    currency: str

    pricing_available: bool
    metadata: dict[str, Any]


class CostEstimator:
    """
    Estimates request cost before an AI request executes.
    """

    def __init__(
        self,
        token_counter: TokenCounter | None = None,
        pricing_cache: PricingCache | None = None,
        calculator: CostCalculator | None = None,
    ) -> None:

        self.token_counter = (
            token_counter or TokenCounter()
        )

        self.pricing_cache = (
            pricing_cache or PricingCache()
        )

        self.calculator = (
            calculator or CostCalculator()
        )

    def estimate(
        self,
        model: str,
        prompt: str | None = None,
        messages: Iterable[Mapping[str, Any]] | None = None,
        max_output_tokens: int | None = None,
        expected_output: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> CostEstimate:

        token_count = self.token_counter.count(
            prompt=prompt,
            messages=messages,
            max_output_tokens=max_output_tokens,
            expected_output=expected_output,
        )

        pricing = self.pricing_cache.get_or_none(
            model
        )

        if pricing is None:

            return CostEstimate(
                model=model,
                input_tokens=token_count.input_tokens,
                output_tokens=token_count.output_tokens,
                total_tokens=token_count.total_tokens,
                input_cost="0",
                output_cost="0",
                total_cost="0",
                currency="USD",
                pricing_available=False,
                metadata={
                    **(metadata or {}),
                    "pricing_missing": True,
                },
            )

        calculation = self.calculator.calculate(
            model=model,
            input_tokens=token_count.input_tokens,
            output_tokens=token_count.output_tokens,
            pricing=pricing,
        )

        return self._build_estimate(
            calculation,
            metadata,
        )

    def estimate_from_tokens(
        self,
        model: str,
        input_tokens: int,
        output_tokens: int,
        metadata: dict[str, Any] | None = None,
    ) -> CostEstimate:

        pricing = self.pricing_cache.get_or_none(
            model
        )

        if pricing is None:

            return CostEstimate(
                model=model,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                total_tokens=(
                    input_tokens + output_tokens
                ),
                input_cost="0",
                output_cost="0",
                total_cost="0",
                currency="USD",
                pricing_available=False,
                metadata={
                    **(metadata or {}),
                    "pricing_missing": True,
                },
            )

        calculation = self.calculator.calculate(
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            pricing=pricing,
        )

        return self._build_estimate(
            calculation,
            metadata,
        )

    def _build_estimate(
        self,
        calculation: CostCalculation,
        metadata: dict[str, Any] | None,
    ) -> CostEstimate:

        return CostEstimate(
            model=calculation.model,
            input_tokens=calculation.input_tokens,
            output_tokens=calculation.output_tokens,
            total_tokens=calculation.total_tokens,
            input_cost=str(calculation.input_cost),
            output_cost=str(calculation.output_cost),
            total_cost=str(calculation.total_cost),
            currency=calculation.currency,
            pricing_available=True,
            metadata=metadata or {},
        )