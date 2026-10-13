from __future__ import annotations

import math
from collections.abc import Sequence


def validate_vector(vector: Sequence[float], name: str = "vector") -> list[float]:
    if isinstance(vector, (str, bytes)) or not isinstance(vector, Sequence):
        raise TypeError(f"{name} must be a sequence of numbers")
    if not vector:
        raise ValueError(f"{name} must not be empty")

    values: list[float] = []
    for value in vector:
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise TypeError(f"{name} must contain only numbers")
        number = float(value)
        if not math.isfinite(number):
            raise ValueError(f"{name} must contain only finite numbers")
        values.append(number)
    return values


def validate_pair(a: Sequence[float], b: Sequence[float]) -> tuple[list[float], list[float]]:
    left = validate_vector(a, "a")
    right = validate_vector(b, "b")
    if len(left) != len(right):
        raise ValueError("vectors must have the same dimension")
    return left, right
