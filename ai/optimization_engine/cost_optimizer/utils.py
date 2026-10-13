from __future__ import annotations

from decimal import Decimal, InvalidOperation
from typing import Iterable, List

from ..models import OptimizationCandidate
from .models import CostOptimizationRequest


def to_decimal(
    value: Decimal | int | float | str,
) -> Decimal:
    """Convert a value to Decimal."""
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError) as exc:
        raise ValueError(
            f"Invalid decimal value: {value}"
        ) from exc


def validate_cost(
    cost: Decimal | int | float | str,
) -> Decimal:
    """Validate a non-negative cost."""
    value = to_decimal(cost)

    if value < Decimal("0"):
        raise ValueError(
            "cost must not be negative"
        )

    return value


def calculate_savings(
    baseline_cost: Decimal | int | float | str,
    optimized_cost: Decimal | int | float | str,
) -> Decimal:
    """Calculate absolute cost savings."""
    baseline = validate_cost(baseline_cost)
    optimized = validate_cost(optimized_cost)

    return max(
        Decimal("0"),
        baseline - optimized,
    )


def calculate_savings_percentage(
    baseline_cost: Decimal | int | float | str,
    optimized_cost: Decimal | int | float | str,
) -> Decimal:
    """Calculate percentage cost savings."""
    baseline = validate_cost(baseline_cost)
    optimized = validate_cost(optimized_cost)

    if baseline == Decimal("0"):
        return Decimal("0")

    savings = calculate_savings(
        baseline,
        optimized,
    )

    return (
        savings / baseline
    ) * Decimal("100")


def is_within_latency(
    latency_ms: Decimal | int | float | str,
    max_latency_ms: Decimal | int | float | str | None,
) -> bool:
    """Check whether latency satisfies the maximum."""
    latency = to_decimal(latency_ms)

    if latency < Decimal("0"):
        raise ValueError(
            "latency must not be negative"
        )

    if max_latency_ms is None:
        return True

    maximum = to_decimal(max_latency_ms)

    if maximum < Decimal("0"):
        raise ValueError(
            "max_latency_ms must not be negative"
        )

    return latency <= maximum


def satisfies_quality(
    quality_score: Decimal | int | float | str,
    min_quality_score: Decimal | int | float | str | None,
) -> bool:
    """Check whether quality satisfies the minimum."""
    quality = to_decimal(quality_score)

    if quality < Decimal("0") or quality > Decimal("1"):
        raise ValueError(
            "quality score must be between 0 and 1"
        )

    if min_quality_score is None:
        return True

    minimum = to_decimal(min_quality_score)

    if minimum < Decimal("0") or minimum > Decimal("1"):
        raise ValueError(
            "min_quality_score must be between 0 and 1"
        )

    return quality >= minimum


def satisfies_cost(
    cost: Decimal | int | float | str,
    max_cost: Decimal | int | float | str | None,
) -> bool:
    """Check whether cost satisfies the maximum."""
    value = validate_cost(cost)

    if max_cost is None:
        return True

    maximum = validate_cost(max_cost)

    return value <= maximum


def is_feasible(
    candidate: OptimizationCandidate,
    request: CostOptimizationRequest,
) -> bool:
    """Determine whether a candidate satisfies cost constraints."""

    return (
        satisfies_cost(
            candidate.estimated_cost,
            request.max_cost,
        )
        and is_within_latency(
            candidate.estimated_latency_ms,
            request.max_latency_ms,
        )
        and satisfies_quality(
            candidate.quality_score,
            request.min_quality_score,
        )
    )


def filter_feasible_candidates(
    candidates: Iterable[OptimizationCandidate],
    request: CostOptimizationRequest,
) -> List[OptimizationCandidate]:
    """Return candidates satisfying all constraints."""
    return [
        candidate
        for candidate in candidates
        if is_feasible(candidate, request)
    ]


def find_baseline(
    request: CostOptimizationRequest,
) -> OptimizationCandidate | None:
    """Find the current model/provider candidate."""
    if request.current_model is None:
        return None

    for candidate in request.candidates:
        if candidate.model != request.current_model:
            continue

        if (
            request.current_provider is not None
            and candidate.provider
            != request.current_provider
        ):
            continue

        return candidate

    return None


__all__ = [
    "to_decimal",
    "validate_cost",
    "calculate_savings",
    "calculate_savings_percentage",
    "is_within_latency",
    "satisfies_quality",
    "satisfies_cost",
    "is_feasible",
    "filter_feasible_candidates",
    "find_baseline",
]
