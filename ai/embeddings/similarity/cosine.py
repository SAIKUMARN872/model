"""
Cosine similarity implementation.
"""

from __future__ import annotations

import math
from typing import Iterable


def cosine_similarity(
    vector_a: Iterable[float],
    vector_b: Iterable[float],
) -> float:
    """
    Calculate cosine similarity between two vectors.

    Returns a value between -1 and 1.
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

    dot = sum(
        x * y
        for x, y in zip(a, b)
    )

    norm_a = math.sqrt(
        sum(x * x for x in a)
    )

    norm_b = math.sqrt(
        sum(y * y for y in b)
    )

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return dot / (
        norm_a * norm_b
    )