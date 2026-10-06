from __future__ import annotations

from decimal import Decimal, InvalidOperation
from typing import Iterable, List

from ..models import OptimizationCandidate
from .models import LatencyOptimizationRequest


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


def validate_latency(
    latency_ms: Decimal | int | float | str,
) -> Decimal:
    """Validate a non-negative latency value."""
    value = to_decimal(latency_ms)

    if value < Decimal("0"):
        raise ValueError(
            "latency_ms must not be negative"
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


def calculate_latency_reduction(
    baseline_latency_ms: Decimal | int | float | str,
    optimized_latency_ms: Decimal | int | float | str,
) -> Decimal:
    """Calculate absolute latency reduction."""
    baseline = validate_latency(
        baseline_latency_ms
    )
    optimized = validate_latency(
        optimized_latency_ms
    )

    return max(
        Decimal("0"),
        baseline - optimized,
    )


def calculate_latency_reduction_percentage(
    baseline_latency_ms: Decimal | int | float | str,
    optimized_latency_ms: Decimal | int | float | str,
) -> Decimal:
    """Calculate percentage latency reduction."""
    baseline = validate_latency(
        baseline_latency_ms
    )
    optimized = validate_latency(
        optimized_latency_ms
    )

    if baseline == Decimal("0"):
        return Decimal("0")

    reduction = calculate_latency_reduction(
        baseline,
        optimized,
    )

    return (
        reduction / baseline
    ) * Decimal("100")


def is_within_cost(
    cost: Decimal | int | float | str,
    max_cost: Decimal | int | float | str | None,
) -> bool:
    """Check whether cost satisfies the maximum."""
    value = validate_cost(cost)

    if max_cost is None:
        return True

    maximum = validate_cost(max_cost)

    return value <= maximum


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


def is_within_latency(
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
    request: LatencyOptimizationRequest,
) -> bool:
    """Determine whether a candidate satisfies all constraints."""

    return (
        is_within_cost(
            candidate.estimated_cost,
            request.max_cost,
        )
        and satisfies_quality(
            candidate.quality_score,
            request.min_quality_score,
        )
        and is_within_latency(
            candidate.estimated_latency_ms,
            request.max_latency_ms,
        )
    )


def filter_feasible_candidates(
    candidates: Iterable[OptimizationCandidate],
    request: LatencyOptimizationRequest,
) -> List[OptimizationCandidate]:
    """Return candidates satisfying all latency constraints."""
    return [
        candidate
        for candidate in candidates
        if is_feasible(candidate, request)
    ]


def find_baseline(
    request: LatencyOptimizationRequest,
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
    "validate_latency",
    "validate_cost",
    "validate_quality",
    "calculate_latency_reduction",
    "calculate_latency_reduction_percentage",
    "is_within_cost",
    "satisfies_quality",
    "is_within_latency",
    "is_feasible",
    "filter_feasible_candidates",
    "find_baseline",
]
