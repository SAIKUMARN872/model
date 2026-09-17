"""
BGE-specific utility functions.
"""

from __future__ import annotations

import math
from typing import Iterable


def normalize_vector(
    vector: Iterable[float],
) -> list[float]:

    values = [
        float(value)
        for value in vector
    ]

    norm = math.sqrt(
        sum(
            value * value
            for value in values
        )
    )

    if norm == 0:
        return values

    return [
        value / norm
        for value in values
    ]


def vector_dimension(
    vector: Iterable[float],
) -> int:

    return len(
        list(vector)
    )


def validate_vector(
    vector: Iterable[float],
    expected_dimension: int | None = None,
) -> list[float]:

    values = [
        float(value)
        for value in vector
    ]

    if expected_dimension is not None:

        if len(values) != expected_dimension:
            raise ValueError(
                f"Expected dimension "
                f"{expected_dimension}, "
                f"got {len(values)}."
            )

    if any(
        not math.isfinite(value)
        for value in values
    ):
        raise ValueError(
            "Vector contains non-finite values."
        )

    return values