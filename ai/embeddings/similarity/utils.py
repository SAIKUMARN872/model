"""
Shared similarity utilities.
"""

from __future__ import annotations

import math
from typing import Iterable


def validate_vector(
    vector: Iterable[float],
) -> list[float]:
    """
    Validate and convert a vector to floats.
    """

    if vector is None:
        raise ValueError(
            "Vector cannot be None"
        )

    try:
        result = [
            float(value)
            for value in vector
        ]
    except (
        TypeError,
        ValueError,
    ) as exc:
        raise ValueError(
            "Vector contains invalid values"
        ) from exc

    if not result:
        raise ValueError(
            "Vector cannot be empty"
        )

    if not all(
        math.isfinite(value)
        for value in result
    ):
        raise ValueError(
            "Vector contains non-finite values"
        )

    return result


def validate_pair(
    vector_a: Iterable[float],
    vector_b: Iterable[float],
) -> tuple[list[float], list[float]]:
    """
    Validate two vectors and ensure dimensions match.
    """

    a = validate_vector(
        vector_a
    )

    b = validate_vector(
        vector_b
    )

    if len(a) != len(b):
        raise ValueError(
            "Vector dimensions do not match"
        )

    return a, b


def vector_norm(
    vector: Iterable[float],
) -> float:

    values = validate_vector(
        vector
    )

    return math.sqrt(
        sum(
            value * value
            for value in values
        )
    )


def normalize_vector(
    vector: Iterable[float],
) -> list[float]:

    values = validate_vector(
        vector
    )

    norm = vector_norm(
        values
    )

    if norm == 0:
        return values

    return [
        value / norm
        for value in values
    ]


def normalize_vectors(
    vectors: Iterable[
        Iterable[float]
    ],
) -> list[list[float]]:

    return [
        normalize_vector(vector)
        for vector in vectors
    ]


def similarity_to_distance(
    similarity: float,
) -> float:
    """
    Convert cosine-style similarity to a distance.
    """

    return 1.0 - float(similarity)


def distance_to_similarity(
    distance: float,
) -> float:
    """
    Convert a non-negative distance to similarity.
    """

    distance = float(distance)

    if distance < 0:
        raise ValueError(
            "Distance cannot be negative"
        )

    return 1.0 / (
        1.0 + distance
    )


def validate_metric(
    metric: str,
) -> str:

    metric = metric.strip().lower()

    supported = {
        "cosine",
        "dot",
        "dot_product",
        "euclidean",
        "l2",
    }

    if metric not in supported:
        raise ValueError(
            f"Unsupported similarity metric: {metric}. "
            f"Supported metrics: {sorted(supported)}"
        )

    return metric