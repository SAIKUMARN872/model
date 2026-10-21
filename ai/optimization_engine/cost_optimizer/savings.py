"""Savings analysis utilities for the ModelNow cost optimizer."""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Iterable

from .utils import (
    calculate_savings,
    calculate_savings_percentage,
    to_decimal,
)


@dataclass(frozen=True)
class SavingsAnalysis:
    """Represents cost savings between a baseline and optimized cost."""

    baseline_cost: Decimal
    optimized_cost: Decimal
    savings: Decimal
    savings_percentage: Decimal

    @property
    def improved(self) -> bool:
        """Return whether the optimized cost is lower."""
        return self.savings > Decimal("0")

    def as_dict(self) -> dict[str, str | bool]:
        """Serialize the savings analysis."""
        return {
            "baseline_cost": str(self.baseline_cost),
            "optimized_cost": str(self.optimized_cost),
            "savings": str(self.savings),
            "savings_percentage": str(
                self.savings_percentage
            ),
            "improved": self.improved,
        }


def analyze_savings(
    baseline_cost: Decimal | int | float | str,
    optimized_cost: Decimal | int | float | str,
) -> SavingsAnalysis:
    """Calculate absolute and percentage savings."""
    baseline = to_decimal(baseline_cost)
    optimized = to_decimal(optimized_cost)

    if baseline < Decimal("0"):
        raise ValueError(
            "baseline_cost must be non-negative"
        )

    if optimized < Decimal("0"):
        raise ValueError(
            "optimized_cost must be non-negative"
        )

    savings = calculate_savings(
        baseline,
        optimized,
    )

    percentage = calculate_savings_percentage(
        baseline,
        optimized,
    )

    return SavingsAnalysis(
        baseline_cost=baseline,
        optimized_cost=optimized,
        savings=savings,
        savings_percentage=percentage,
    )


def aggregate_savings(
    baseline_costs: Iterable[
        Decimal | int | float | str
    ],
    optimized_costs: Iterable[
        Decimal | int | float | str
    ],
) -> SavingsAnalysis:
    """Calculate savings across multiple requests."""
    baseline_values = [
        to_decimal(value)
        for value in baseline_costs
    ]
    optimized_values = [
        to_decimal(value)
        for value in optimized_costs
    ]

    if len(baseline_values) != len(optimized_values):
        raise ValueError(
            "baseline_costs and optimized_costs "
            "must contain the same number of values"
        )

    baseline_total = sum(
        baseline_values,
        Decimal("0"),
    )
    optimized_total = sum(
        optimized_values,
        Decimal("0"),
    )

    return analyze_savings(
        baseline_total,
        optimized_total,
    )


def savings_from_percentage(
    baseline_cost: Decimal | int | float | str,
    savings_percentage: Decimal | int | float | str,
) -> Decimal:
    """Calculate savings amount from a percentage."""
    baseline = to_decimal(baseline_cost)
    percentage = to_decimal(savings_percentage)

    if baseline < Decimal("0"):
        raise ValueError(
            "baseline_cost must be non-negative"
        )

    if percentage < Decimal("0"):
        raise ValueError(
            "savings_percentage must be non-negative"
        )

    return (
        baseline
        * percentage
        / Decimal("100")
    )


def optimized_cost_from_savings(
    baseline_cost: Decimal | int | float | str,
    savings: Decimal | int | float | str,
) -> Decimal:
    """Calculate optimized cost after applying savings."""
    baseline = to_decimal(baseline_cost)
    savings_value = to_decimal(savings)

    if baseline < Decimal("0"):
        raise ValueError(
            "baseline_cost must be non-negative"
        )

    if savings_value < Decimal("0"):
        raise ValueError(
            "savings must be non-negative"
        )

    optimized = baseline - savings_value

    if optimized < Decimal("0"):
        raise ValueError(
            "savings cannot exceed baseline_cost"
        )

    return optimized


__all__ = [
    "SavingsAnalysis",
    "aggregate_savings",
    "analyze_savings",
    "optimized_cost_from_savings",
    "savings_from_percentage",
]
