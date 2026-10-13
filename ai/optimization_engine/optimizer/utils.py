from __future__ import annotations

from decimal import Decimal, InvalidOperation
from typing import Any


def to_decimal(value: Any, default: Decimal = Decimal("0")) -> Decimal:
    if isinstance(value, Decimal):
        return value

    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return default


def validate_request(request: Any) -> Any:
    if request is None:
        raise ValueError("request must not be None")
    return request


def validate_candidates(candidates: Any) -> list[Any]:
    if candidates is None:
        return []

    if isinstance(candidates, (str, bytes)):
        raise TypeError("candidates must be an iterable of candidate objects")

    try:
        return list(candidates)
    except TypeError as exc:
        raise TypeError("candidates must be iterable") from exc


def normalize_weights(
    weights: dict[str, Any],
    *,
    default: Decimal = Decimal("0"),
) -> dict[str, Decimal]:
    if not isinstance(weights, dict):
        raise TypeError("weights must be a dictionary")

    normalized = {
        str(key): to_decimal(value, default)
        for key, value in weights.items()
    }

    return {
        key: max(Decimal("0"), value)
        for key, value in normalized.items()
    }


def normalize_score(value: Any) -> Decimal:
    score = to_decimal(value)

    if score < Decimal("0"):
        return Decimal("0")

    if score > Decimal("1"):
        return Decimal("1")

    return score


def calculate_weighted_score(
    scores: dict[str, Any],
    weights: dict[str, Any],
) -> Decimal:
    normalized_scores = {
        str(key): normalize_score(value)
        for key, value in scores.items()
    }

    normalized_weights = normalize_weights(weights)

    total_weight = sum(normalized_weights.values(), Decimal("0"))

    if total_weight <= Decimal("0"):
        return Decimal("0")

    weighted_total = sum(
        normalized_scores.get(key, Decimal("0")) * weight
        for key, weight in normalized_weights.items()
    )

    return weighted_total / total_weight


def is_better_score(
    candidate_score: Any,
    current_score: Any,
) -> bool:
    return normalize_score(candidate_score) > normalize_score(current_score)


def clamp_decimal(
    value: Any,
    minimum: Any = Decimal("0"),
    maximum: Any = Decimal("1"),
) -> Decimal:
    decimal_value = to_decimal(value)
    minimum_value = to_decimal(minimum)
    maximum_value = to_decimal(maximum)

    if minimum_value > maximum_value:
        raise ValueError("minimum must not be greater than maximum")

    return max(
        minimum_value,
        min(decimal_value, maximum_value),
    )
