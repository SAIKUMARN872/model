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
    if not 1 <= value <= 2048:
        raise ValueError("batch_size must be between 1 and 2048")


def normalize_vector(vector: list[float]) -> list[float]:
    norm = math.sqrt(sum(value * value for value in vector))
    if not math.isfinite(norm) or norm == 0:
        raise ValueError("embedding vector must have a finite, non-zero norm")
    return [value / norm for value in vector]


def validate_vector(vector: Sequence[float], dimensions: int | None = None) -> list[float]:
    values = [float(value) for value in vector]
    if not values:
        raise ValueError("embedding vector must not be empty")
    if dimensions is not None and len(values) != dimensions:
        raise ValueError(
            f"Embedding dimension {len(values)} does not match configured dimension {dimensions}"
        )
    if not all(math.isfinite(value) for value in values):
        raise ValueError("embedding vector contains non-finite values")
    return values
