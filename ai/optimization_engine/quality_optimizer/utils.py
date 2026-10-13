from __future__ import annotations

from decimal import Decimal, InvalidOperation
from typing import Iterable, List

from ..models import OptimizationCandidate


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


def validate_quality(
    quality_score: Decimal | int | float | str,
) -> Decimal:
    """Validate a quality score between 0 and 1."""
    value = to_decimal(quality_score)

    if value < Decimal("0") or value > Decimal("1"):
        raise ValueError(
            "quality_score must be between 0 and 1"
        )

    return value


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


def validate_latency(
    latency_ms: Decimal | int | float | str,
) -> Decimal:
    """Validate a non-negative latency."""
    value = to_decimal(latency_ms)

    if value < Decimal("0"):
        raise ValueError(
            "latency_ms must not be negative"
        )

    return value


def calculate_quality_improvement(
    baseline_quality: Decimal | int | float | str,
    optimized_quality: Decimal | int | float | str,
) -> Decimal:
    """Calculate absolute quality improvement."""
    baseline = validate_quality(
        baseline_quality
    )
    optimized = validate_quality(
        optimized_quality
    )

    return max(
        Decimal("0"),
        optimized - baseline,
    )


def calculate_quality_improvement_percentage(
    baseline_quality: Decimal | int | float | str,
    optimized_quality: Decimal | int | float | str,
) -> Decimal:
    """Calculate percentage quality improvement."""
    baseline = validate_quality(
        baseline_quality
    )
    optimized = validate_quality(
        optimized_quality
    )

    if baseline == Decimal("0"):
        return Decimal("0")

    improvement = calculate_quality_improvement(
        baseline,
        optimized,
    )

    return (
        improvement / baseline
    ) * Decimal("100")


def satisfies_quality(
    quality_score: Decimal | int | float | str,
    min_quality_score: Decimal | int | float | str | None,
) -> bool:
    """Check whether quality satisfies the minimum."""
    quality = validate_quality(
        quality_score
    )

    if min_quality_score is None:
        return True

    minimum = validate_quality(
        min_quality_score
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


def satisfies_latency(
    latency_ms: Decimal | int | float | str,
    max_latency_ms: Decimal | int | float | str | None,
) -> bool:
    """Check whether latency satisfies the maximum."""
    latency = validate_latency(
        latency_ms
    )

    if max_latency_ms is None:
        return True

    maximum = validate_latency(
        max_latency_ms
    )

    return latency <= maximum


def is_feasible(
    candidate: OptimizationCandidate,
    min_quality_score: Decimal | int | float | str | None = None,
    max_cost: Decimal | int | float | str | None = None,
    max_latency_ms: Decimal | int | float | str | None = None,
) -> bool:
    """Determine whether a candidate satisfies quality constraints."""
    return (
        satisfies_quality(
            candidate.quality_score,
            min_quality_score,
        )
        and satisfies_cost(
            candidate.estimated_cost,
            max_cost,
        )
        and satisfies_latency(
            candidate.estimated_latency_ms,
            max_latency_ms,
        )
    )


def filter_feasible_candidates(
    candidates: Iterable[OptimizationCandidate],
    min_quality_score: Decimal | int | float | str | None = None,
    max_cost: Decimal | int | float | str | None = None,
    max_latency_ms: Decimal | int | float | str | None = None,
) -> List[OptimizationCandidate]:
    """Return candidates satisfying all quality constraints."""
    return [
        candidate
        for candidate in candidates
        if is_feasible(
            candidate,
            min_quality_score=min_quality_score,
            max_cost=max_cost,
            max_latency_ms=max_latency_ms,
        )
    ]


def rank_by_quality(
    candidates: Iterable[OptimizationCandidate],
) -> List[OptimizationCandidate]:
    """Rank candidates from highest to lowest quality."""
    return sorted(
        candidates,
        key=lambda candidate: (
            candidate.quality_score,
            -candidate.estimated_latency_ms,
            -candidate.estimated_cost,
        ),
        reverse=True,
    )


__all__ = [
    "to_decimal",
    "validate_quality",
    "validate_cost",
    "validate_latency",
    "calculate_quality_improvement",
    "calculate_quality_improvement_percentage",
    "satisfies_quality",
    "satisfies_cost",
    "satisfies_latency",
    "is_feasible",
    "filter_feasible_candidates",
    "rank_by_quality",
]
