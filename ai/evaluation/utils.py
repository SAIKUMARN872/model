"""
Evaluation utility functions.
"""

from __future__ import annotations

import math
import uuid
from datetime import datetime, timezone
from typing import Any, Iterable


def generate_evaluation_id(
    prefix: str = "eval",
) -> str:

    prefix = (
        str(prefix)
        .strip()
        .replace(" ", "_")
    )

    if not prefix:
        prefix = "eval"

    return (
        f"{prefix}_"
        f"{uuid.uuid4().hex}"
    )


def clamp(
    value: float,
    minimum: float = 0.0,
    maximum: float = 1.0,
) -> float:

    if minimum > maximum:
        raise ValueError(
            "minimum cannot be greater than maximum."
        )

    return max(
        minimum,
        min(
            maximum,
            float(value),
        ),
    )


def normalize_score(
    value: float,
    minimum: float = 0.0,
    maximum: float = 1.0,
) -> float:

    if maximum <= minimum:
        raise ValueError(
            "maximum must be greater than minimum."
        )

    result = (
        float(value) - minimum
    ) / (
        maximum - minimum
    )

    return clamp(result)


def percentage(
    score: float,
) -> float:

    return clamp(score) * 100.0


def safe_float(
    value: Any,
    default: float = 0.0,
) -> float:

    try:

        result = float(value)

        if not math.isfinite(result):
            return default

        return result

    except (
        TypeError,
        ValueError,
    ):

        return default


def average(
    values: Iterable[float],
) -> float:

    values = list(values)

    if not values:
        return 0.0

    return sum(
        float(value)
        for value in values
    ) / len(values)


def weighted_average(
    values: dict[str, float],
    weights: dict[str, float],
) -> float:

    total = 0.0
    weight_total = 0.0

    for name, value in values.items():

        weight = float(
            weights.get(
                name,
                0.0,
            )
        )

        if weight <= 0:
            continue

        total += (
            float(value)
            * weight
        )

        weight_total += weight

    if weight_total == 0:
        return 0.0

    return total / weight_total


def exact_match(
    first: Any,
    second: Any,
) -> float:

    return (
        1.0
        if first == second
        else 0.0
    )


def text_similarity(
    first: str,
    second: str,
) -> float:

    first_tokens = set(
        str(first)
        .lower()
        .split()
    )

    second_tokens = set(
        str(second)
        .lower()
        .split()
    )

    if not first_tokens and not second_tokens:
        return 1.0

    if not first_tokens or not second_tokens:
        return 0.0

    intersection = (
        first_tokens
        & second_tokens
    )

    union = (
        first_tokens
        | second_tokens
    )

    return (
        len(intersection)
        / len(union)
    )


def merge_metadata(
    *metadata: dict[str, Any],
) -> dict[str, Any]:

    result: dict[str, Any] = {}

    for item in metadata:

        if item:
            result.update(item)

    return result


def utc_now() -> datetime:

    return datetime.now(
        timezone.utc
    )