from __future__ import annotations

from decimal import Decimal, InvalidOperation
from typing import Mapping


def to_decimal(value: object) -> Decimal:
    """Convert a numeric value to Decimal safely."""
    if isinstance(value, bool):
        raise TypeError("boolean values are not valid weights")

    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError) as exc:
        raise ValueError(f"invalid numeric weight: {value!r}") from exc


def validate_weight(value: object) -> Decimal:
    """Validate and return a non-negative routing weight."""
    weight = to_decimal(value)

    if not weight.is_finite():
        raise ValueError("weight must be finite")

    if weight < 0:
        raise ValueError("weight cannot be negative")

    return weight


def normalize_weights(
    weights: Mapping[str, object],
) -> dict[str, Decimal]:
    """Normalize weights so their total equals 1."""
    if not weights:
        return {}

    validated: dict[str, Decimal] = {}

    for target, value in weights.items():
        if not isinstance(target, str) or not target.strip():
            raise ValueError("weight target must be a non-empty string")

        validated[target] = validate_weight(value)

    total = sum(validated.values(), Decimal("0"))

    if total <= 0:
        raise ValueError("at least one routing weight must be greater than zero")

    return {
        target: weight / total
        for target, weight in validated.items()
    }


def calculate_weighted_score(
    weight: object,
    load: object = 0,
    latency_ms: object = 0,
) -> Decimal:
    """Calculate a simple routing score from weight, load and latency."""
    normalized_weight = validate_weight(weight)
    normalized_load = validate_weight(load)
    normalized_latency = validate_weight(latency_ms)

    denominator = (
        Decimal("1")
        + normalized_load
        + (normalized_latency / Decimal("1000"))
    )

    return normalized_weight / denominator


def highest_weight(
    weights: Mapping[str, object],
) -> str | None:
    """Return the target with the highest validated weight."""
    if not weights:
        return None

    normalized = {
        target: validate_weight(value)
        for target, value in weights.items()
    }

    return max(
        normalized,
        key=lambda target: normalized[target],
    )


__all__ = [
    "calculate_weighted_score",
    "highest_weight",
    "normalize_weights",
    "to_decimal",
    "validate_weight",
]
