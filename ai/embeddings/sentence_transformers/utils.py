from __future__ import annotations

import math
from collections.abc import Sequence
from typing import Any


def validate_texts(texts: Sequence[str]) -> list[str]:
    if isinstance(texts, (str, bytes)) or not isinstance(texts, Sequence):
        raise TypeError("texts must be a sequence of strings")

    values = list(texts)
    for index, text in enumerate(values):
        if not isinstance(text, str):
            raise TypeError(f"texts[{index}] must be a string")
        if not text.strip():
            raise ValueError(f"texts[{index}] must not be empty")
    return values


def validate_batch_size(batch_size: int) -> int:
    if isinstance(batch_size, bool) or not isinstance(batch_size, int):
        raise TypeError("batch_size must be an integer")
    if not 1 <= batch_size <= 512:
        raise ValueError("batch_size must be between 1 and 512")
    return batch_size


def validate_dimension(dimension: int | None) -> int | None:
    if dimension is None:
        return None
    if isinstance(dimension, bool) or not isinstance(dimension, int):
        raise TypeError("dimension must be an integer or None")
    if dimension < 1:
        raise ValueError("dimension must be positive")
    return dimension


def to_python_vectors(output: Any) -> list[list[float]]:
    if hasattr(output, "detach"):
        output = output.detach()
    if hasattr(output, "cpu"):
        output = output.cpu()
    if hasattr(output, "tolist"):
        output = output.tolist()

    if not isinstance(output, (list, tuple)):
        raise TypeError("model output must be a two-dimensional sequence")

    vectors: list[list[float]] = []
    for row_index, row in enumerate(output):
        if hasattr(row, "tolist"):
            row = row.tolist()
        if not isinstance(row, (list, tuple)):
            raise TypeError(f"embedding row {row_index} must be a sequence")
        if not row:
            raise ValueError("embedding vectors must not be empty")

        vector: list[float] = []
        for value in row:
            if isinstance(value, bool) or not isinstance(value, (int, float)):
                raise TypeError("embedding values must be numeric")
            number = float(value)
            if not math.isfinite(number):
                raise ValueError("embedding values must be finite")
            vector.append(number)
        vectors.append(vector)

    return vectors


def validate_vectors(
    vectors: list[list[float]],
    expected_count: int,
    expected_dimension: int | None = None,
) -> list[list[float]]:
    if len(vectors) != expected_count:
        raise ValueError(
            f"Expected {expected_count} vectors, received {len(vectors)}"
        )
    if not vectors:
        return vectors

    dimension = len(vectors[0])
    if expected_dimension is not None and dimension != expected_dimension:
        raise ValueError(
            f"Expected dimension {expected_dimension}, received {dimension}"
        )
    if dimension == 0:
        raise ValueError("embedding dimension must be positive")
    if any(len(vector) != dimension for vector in vectors):
        raise ValueError("embedding vectors have inconsistent dimensions")
    return vectors


def l2_normalize(vector: list[float]) -> list[float]:
    norm = math.sqrt(sum(value * value for value in vector))
    if norm == 0:
        raise ValueError("cannot normalize a zero vector")
    return [value / norm for value in vector]
