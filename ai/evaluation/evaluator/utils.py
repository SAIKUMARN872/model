"""
Evaluation helper utilities.
"""

from __future__ import annotations

import math
from typing import Any


def safe_average(
    values: list[float],
) -> float:

    if not values:
        return 0.0

    return sum(
        values
    ) / len(values)


def percentage(
    value: float,
) -> float:

    return max(
        0.0,
        min(
            float(value),
            1.0,
        ),
    ) * 100.0


def normalize_score(
    score: Any,
) -> float:

    if hasattr(
        score,
        "value",
    ):

        score = score.value

    score = float(score)

    if math.isnan(score):
        return 0.0

    return max(
        0.0,
        min(
            score,
            1.0,
        ),
    )


def flatten_metadata(
    metadata: dict[str, Any],
    prefix: str = "",
) -> dict[str, Any]:

    result: dict[str, Any] = {}

    for key, value in metadata.items():

        full_key = (
            f"{prefix}.{key}"
            if prefix
            else key
        )

        if isinstance(
            value,
            dict,
        ):

            result.update(
                flatten_metadata(
                    value,
                    full_key,
                )
            )

        else:

            result[full_key] = value

    return result