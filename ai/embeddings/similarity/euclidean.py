"""
Euclidean distance and similarity.
"""

from __future__ import annotations

import math
from typing import Iterable


def euclidean_distance(
    vector_a: Iterable[float],
    vector_b: Iterable[float],
) -> float:
    """
    Calculate Euclidean distance.
    """

    a = [float(x) for x in vector_a]
    b = [float(x) for x in vector_b]

    if len(a) != len(b):
        raise ValueError(
            "Vectors must have the same dimensions"
        )

    if not a:
        raise ValueError(
            "Vectors cannot be empty"
        )

    return math.sqrt(
        sum(
            (x - y) ** 2
            for x, y in zip(a, b)
        )
    )


def euclidean_similarity(
    vector_a: Iterable[float],
    vector_b: Iterable[float],
) -> float:
    """
    Convert Euclidean distance into a similarity score.

    The returned value is in the range (0, 1].
    """

    distance = euclidean_distance(
        vector_a,
        vector_b,
    )

    return 1.0 / (
        1.0 + distance
    )


def squared_euclidean_distance(
    vector_a: Iterable[float],
    vector_b: Iterable[float],
) -> float:
    """
    Calculate squared Euclidean distance.
    """

    a = [float(x) for x in vector_a]
    b = [float(x) for x in vector_b]

    if len(a) != len(b):
        raise ValueError(
            "Vectors must have the same dimensions"
        )

    return sum(
        (x - y) ** 2
        for x, y in zip(a, b)
    )