"""Validation and numerical helpers for embedding generation."""

import math
from collections.abc import Mapping, Sequence
from typing import Any


def validate_texts(texts: Sequence[str]) -> list[str]:
    if isinstance(texts, (str, bytes)) or not isinstance(texts, Sequence):
        raise TypeError("texts must be a sequence of strings")

    result = list(texts)
    for index, text in enumerate(result):
        if not isinstance(text, str):
            raise TypeError(f"texts[{index}] must be a string")
        if not text.strip():
            raise ValueError(f"texts[{index}] must not be blank")
    return result


def validate_metadata(
    metadata: Sequence[Mapping[str, Any] | None] | None,
    expected_count: int,
) -> list[dict[str, Any] | None]:
    if metadata is None:
        return [None] * expected_count

    if isinstance(metadata, (str, bytes)) or not isinstance(metadata, Sequence):
        raise TypeError("metadata must be a sequence of mappings or None")

    if len(metadata) != expected_count:
        raise ValueError("metadata count must match the text count")

    result: list[dict[str, Any] | None] = []
    for index, item in enumerate(metadata):
        if item is None:
            result.append(None)
        elif isinstance(item, Mapping):
            result.append(dict(item))
        else:
            raise TypeError(f"metadata[{index}] must be a mapping or None")
    return result


def validate_vectors(
    vectors: Sequence[Sequence[float]],
    expected_count: int,
    normalize: bool = False,
) -> list[list[float]]:
    if isinstance(vectors, (str, bytes)) or not isinstance(vectors, Sequence):
        raise TypeError("vectors must be a sequence of vectors")

    if len(vectors) != expected_count:
        raise ValueError(
            f"Expected {expected_count} vectors, received {len(vectors)}"
        )

    result: list[list[float]] = []
    dimension: int | None = None

    for row_index, vector in enumerate(vectors):
        if isinstance(vector, (str, bytes)) or not isinstance(vector, Sequence):
            raise TypeError(f"vectors[{row_index}] must be a sequence")

        values: list[float] = []
        for col_index, value in enumerate(vector):
            if isinstance(value, bool) or not isinstance(value, (int, float)):
                raise TypeError(
                    f"vectors[{row_index}][{col_index}] must be numeric"
                )
            number = float(value)
            if not math.isfinite(number):
                raise ValueError(
                    f"vectors[{row_index}][{col_index}] must be finite"
                )
            values.append(number)

        if not values:
            raise ValueError(f"vectors[{row_index}] must not be empty")

        if dimension is None:
            dimension = len(values)
        elif len(values) != dimension:
            raise ValueError("All embedding vectors must have the same dimension")

        if normalize:
            norm = math.sqrt(sum(value * value for value in values))
            if norm <= 0.0:
                raise ValueError("Cannot normalize a zero vector")
            values = [value / norm for value in values]

        result.append(values)

    return result


def chunked(items: Sequence[Any], batch_size: int) -> list[list[Any]]:
    if isinstance(batch_size, bool) or not isinstance(batch_size, int):
        raise TypeError("batch_size must be an integer")
    if not 1 <= batch_size <= 512:
        raise ValueError("batch_size must be between 1 and 512")
    return [
        list(items[start:start + batch_size])
        for start in range(0, len(items), batch_size)
    ]
