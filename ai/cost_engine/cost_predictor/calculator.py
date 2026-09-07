from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal

from .pricing_cache import ModelPricing
from .utils import round_cost


@dataclass(frozen=True)
class CostCalculation:
    """Result of a cost calculation."""

    input_tokens: int
    output_tokens: int

    input_cost: Decimal
    output_cost: Decimal
    total_cost: Decimal

    currency: str
    model: str

    @property
    def total_tokens(self) -> int:
        return self.input_tokens + self.output_tokens


class CostCalculator:
    """
    Calculates LLM cost from token usage and model pricing.
    """

    TOKENS_PER_UNIT = Decimal("1000")

    def calculate(
        self,
        model: str,
        input_tokens: int,
        output_tokens: int,
        pricing: ModelPricing,
    ) -> CostCalculation:

        if input_tokens < 0:
            raise ValueError(
                "input_tokens cannot be negative"
            )

        if output_tokens < 0:
            raise ValueError(
                "output_tokens cannot be negative"
            )

        input_cost = (
            Decimal(input_tokens)
            / self.TOKENS_PER_UNIT
            * pricing.input_cost_per_1k
        )

        output_cost = (
            Decimal(output_tokens)
            / self.TOKENS_PER_UNIT
            * pricing.output_cost_per_1k
        )

        total_cost = input_cost + output_cost

        return CostCalculation(
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            input_cost=round_cost(input_cost),
            output_cost=round_cost(output_cost),
            total_cost=round_cost(total_cost),
            currency=pricing.currency,
            model=model,
        )

    def calculate_from_total(
        self,
        model: str,
        total_tokens: int,
        pricing: ModelPricing,
        input_ratio: Decimal = Decimal("0.75"),
    ) -> CostCalculation:

        if total_tokens < 0:
            raise ValueError(
                "total_tokens cannot be negative"
            )

        if not 0 <= input_ratio <= 1:
            raise ValueError(
                "input_ratio must be between 0 and 1"
            )

        input_tokens = int(
            Decimal(total_tokens) * input_ratio
        )

        output_tokens = (
            total_tokens - input_tokens
        )

        return self.calculate(
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            pricing=pricing,
        )