from __future__ import annotations

import math
from collections.abc import Sequence


def _validate_vector(vector: Sequence[float]) -> list[float]:
    if isinstance(vector, (str, bytes)) or not isinstance(vector, Sequence):
        raise TypeError("vector must be a sequence of numbers")

    if not vector:
        raise ValueError("vector must not be empty")

    values: list[float] = []

    for index, value in enumerate(vector):
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise TypeError(f"vector[{index}] must be numeric")

        number = float(value)

        if not math.isfinite(number):
            raise ValueError(f"vector[{index}] must be finite")

        values.append(number)

    return values


def l2_normalize(vector: Sequence[float]) -> list[float]:
    values = _validate_vector(vector)
    norm = math.sqrt(sum(value * value for value in values))

    if norm == 0:
        raise ValueError("cannot normalize a zero vector")

    return [value / norm for value in values]


def l1_normalize(vector: Sequence[float]) -> list[float]:
    values = _validate_vector(vector)
    norm = sum(abs(value) for value in values)

    if norm == 0:
        raise ValueError("cannot normalize a zero vector")

    return [value / norm for value in values]


def normalize_vector(
    vector: Sequence[float],
    *,
    norm: str = "l2",
) -> list[float]:
    if norm == "l2":
        return l2_normalize(vector)
    if norm == "l1":
        return l1_normalize(vector)

    raise ValueError("norm must be 'l1' or 'l2'")


def normalize_vectors(
    vectors: Sequence[Sequence[float]],
    *,
    norm: str = "l2",
) -> list[list[float]]:
    if isinstance(vectors, (str, bytes)) or not isinstance(vectors, Sequence):
        raise TypeError("vectors must be a sequence")

    return [normalize_vector(vector, norm=norm) for vector in vectors]


def min_max_scale(
    vector: Sequence[float],
) -> list[float]:
    values = _validate_vector(vector)
    minimum = min(values)
    maximum = max(values)

    if maximum == minimum:
        return [0.0 for _ in values]

    return [(value - minimum) / (maximum - minimum) for value in values]
