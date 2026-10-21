from __future__ import annotations

import math
from collections.abc import Sequence


def validate_texts(texts: Sequence[str]) -> list[str]:
    if isinstance(texts, (str, bytes)) or not isinstance(texts, Sequence):
        raise TypeError("texts must be a sequence of strings")
    result = list(texts)
    if any(not isinstance(text, str) for text in result):
        raise TypeError("every text must be a string")
    if any(not text.strip() for text in result):
        raise ValueError("texts must not contain empty strings")
    return result


def validate_batch_size(value: int) -> None:
    if isinstance(value, bool) or not isinstance(value, int):
        raise TypeError("batch_size must be an integer")
    if not 1 <= value <= 1000:
        raise ValueError("batch_size must be between 1 and 1000")


def validate_vector(vector, dimensions: int | None = None) -> list[float]:
    if isinstance(vector, (str, bytes)) or not isinstance(vector, Sequence):
        raise TypeError("embedding must be a sequence of numbers")
    values = []
    for value in vector:
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise TypeError("embedding values must be numbers")
        number = float(value)
        if not math.isfinite(number):
            raise ValueError("embedding contains non-finite values")
        values.append(number)
    if not values:
        raise ValueError("embedding must not be empty")
    if dimensions is not None and len(values) != dimensions:
        raise ValueError(
            f"Embedding dimension {len(values)} does not match configured dimension {dimensions}"
        )
    return values


def normalize_vector(vector: list[float]) -> list[float]:
    norm = math.sqrt(sum(value * value for value in vector))
    if norm == 0 or not math.isfinite(norm):
        raise ValueError("cannot normalize a zero or invalid vector")
    return [value / norm for value in vector]
