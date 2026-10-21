from __future__ import annotations

from decimal import Decimal, InvalidOperation
from typing import Iterable, List

from .constants import (
    MAX_QUALITY_SCORE,
    MAX_SCORE,
    MIN_COST,
    MIN_LATENCY_MS,
    MIN_QUALITY_SCORE,
    MIN_SCORE,
)
from .models import (
    OptimizationCandidate,
    OptimizationConstraints,
    OptimizationWeights,
)


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

    if value < MIN_COST:
        raise ValueError(
            "cost must not be negative"
        )

    return value


def validate_latency(
    latency_ms: Decimal | int | float | str,
) -> Decimal:
    """Validate a non-negative latency."""
    value = to_decimal(latency_ms)

    if value < MIN_LATENCY_MS:
        raise ValueError(
            "latency must not be negative"
        )

    return value


def validate_quality(
    quality: Decimal | int | float | str,
) -> Decimal:
    """Validate a quality score between 0 and 1."""
    value = to_decimal(quality)

    if value < MIN_QUALITY_SCORE:
        raise ValueError(
            "quality score must not be negative"
        )

    if value > MAX_QUALITY_SCORE:
        raise ValueError(
            "quality score must not exceed 1"
        )

    return value


def validate_score(
    score: Decimal | int | float | str,
) -> Decimal:
    """Validate a normalized score between 0 and 1."""
    value = to_decimal(score)

    if value < MIN_SCORE or value > MAX_SCORE:
        raise ValueError(
            "score must be between 0 and 1"
        )

    return value


def validate_weights(
    weights: OptimizationWeights,
) -> OptimizationWeights:
    """Validate optimization weights."""
    cost = to_decimal(weights.cost)
    latency = to_decimal(weights.latency)
    quality = to_decimal(weights.quality)

    if cost < MIN_SCORE:
        raise ValueError(
            "cost weight must not be negative"
        )

    if latency < MIN_SCORE:
        raise ValueError(
            "latency weight must not be negative"
        )

    if quality < MIN_SCORE:
        raise ValueError(
            "quality weight must not be negative"
        )

    total = cost + latency + quality

    if total <= MIN_SCORE:
        raise ValueError(
            "optimization weights must have a positive total"
        )

    return OptimizationWeights(
        cost=cost,
        latency=latency,
        quality=quality,
    )


def normalize_weights(
    weights: OptimizationWeights,
) -> OptimizationWeights:
    """Normalize weights so their total equals 1."""
    validated = validate_weights(weights)

    total = validated.total

    return OptimizationWeights(
        cost=validated.cost / total,
        latency=validated.latency / total,
        quality=validated.quality / total,
    )


def normalize_min_score(
    value: Decimal,
    minimum: Decimal,
    maximum: Decimal,
) -> Decimal:
    """Normalize a value where higher is better."""
    if maximum == minimum:
        return Decimal("1")

    result = (
        (value - minimum)
        / (maximum - minimum)
    )

    return max(
        MIN_SCORE,
        min(MAX_SCORE, result),
    )


def normalize_max_score(
    value: Decimal,
    minimum: Decimal,
    maximum: Decimal,
) -> Decimal:
    """Normalize a value where lower is better."""
    if maximum == minimum:
        return Decimal("1")

    result = (
        (maximum - value)
        / (maximum - minimum)
    )

    return max(
        MIN_SCORE,
        min(MAX_SCORE, result),
    )


def normalize_costs(
    candidates: Iterable[OptimizationCandidate],
) -> List[Decimal]:
    """Return normalized cost scores for candidates."""
    items = list(candidates)

    if not items:
        return []

    costs = [
        validate_cost(candidate.estimated_cost)
        for candidate in items
    ]

    minimum = min(costs)
    maximum = max(costs)

    return [
        normalize_max_score(
            value,
            minimum,
            maximum,
        )
        for value in costs
    ]


def normalize_latencies(
    candidates: Iterable[OptimizationCandidate],
) -> List[Decimal]:
    """Return normalized latency scores for candidates."""
    items = list(candidates)

    if not items:
        return []

    latencies = [
        validate_latency(
            candidate.estimated_latency_ms
        )
        for candidate in items
    ]

    minimum = min(latencies)
    maximum = max(latencies)

    return [
        normalize_max_score(
            value,
            minimum,
            maximum,
        )
        for value in latencies
    ]


def normalize_qualities(
    candidates: Iterable[OptimizationCandidate],
) -> List[Decimal]:
    """Return normalized quality scores for candidates."""
    items = list(candidates)

    if not items:
        return []

    qualities = [
        validate_quality(candidate.quality_score)
        for candidate in items
    ]

    minimum = min(qualities)
    maximum = max(qualities)

    return [
        normalize_min_score(
            value,
            minimum,
            maximum,
        )
        for value in qualities
    ]


def weighted_score(
    cost_score: Decimal,
    latency_score: Decimal,
    quality_score: Decimal,
    weights: OptimizationWeights,
) -> Decimal:
    """Calculate the weighted optimization score."""
    normalized = normalize_weights(weights)

    return (
        cost_score * normalized.cost
        + latency_score * normalized.latency
        + quality_score * normalized.quality
    )


def candidate_is_feasible(
    candidate: OptimizationCandidate,
    constraints: OptimizationConstraints,
) -> bool:
    """Check whether a candidate satisfies constraints."""

    if constraints.max_cost is not None:
        if candidate.estimated_cost > constraints.max_cost:
            return False

    if constraints.max_latency_ms is not None:
        if (
            candidate.estimated_latency_ms
            > constraints.max_latency_ms
        ):
            return False

    if constraints.min_quality_score is not None:
        if (
            candidate.quality_score
            < constraints.min_quality_score
        ):
            return False

    if constraints.allowed_models:
        if candidate.model not in constraints.allowed_models:
            return False

    if constraints.allowed_providers:
        if (
            candidate.provider
            not in constraints.allowed_providers
        ):
            return False

    return True


def filter_feasible_candidates(
    candidates: Iterable[OptimizationCandidate],
    constraints: OptimizationConstraints,
) -> List[OptimizationCandidate]:
    """Return only candidates satisfying constraints."""
    return [
        candidate
        for candidate in candidates
        if candidate_is_feasible(
            candidate,
            constraints,
        )
    ]


__all__ = [
    "to_decimal",
    "validate_cost",
    "validate_latency",
    "validate_quality",
    "validate_score",
    "validate_weights",
    "normalize_weights",
    "normalize_min_score",
    "normalize_max_score",
    "normalize_costs",
    "normalize_latencies",
    "normalize_qualities",
    "weighted_score",
    "candidate_is_feasible",
    "filter_feasible_candidates",
]
