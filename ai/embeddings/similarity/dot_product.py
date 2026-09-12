"""
Dot-product similarity implementation.
"""

from __future__ import annotations

from typing import Iterable


def dot_product(
    vector_a: Iterable[float],
    vector_b: Iterable[float],
) -> float:
    """
    Calculate the dot product of two vectors.
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

    return sum(
        x * y
        for x, y in zip(a, b)
    )


def dot_product_similarity(
    vector_a: Iterable[float],
    vector_b: Iterable[float],
) -> float:
    """
    Alias for dot-product similarity.
    """

    return dot_product(
        vector_a,
        vector_b,
    )