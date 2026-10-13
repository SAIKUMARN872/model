"""Configuration and utilities for embedding index construction."""

from collections.abc import Mapping, Sequence
from typing import Any


def validate_vectors(vectors: Sequence[Sequence[float]]) -> list[list[float]]:
    if isinstance(vectors, (str, bytes)) or not isinstance(vectors, Sequence):
        raise TypeError("vectors must be a sequence")

    result: list[list[float]] = []
    dimension = None

    for row_index, row in enumerate(vectors):
        if isinstance(row, (str, bytes)) or not isinstance(row, Sequence):
            raise TypeError(f"vectors[{row_index}] must be a sequence")
        if not row:
            raise ValueError(f"vectors[{row_index}] cannot be empty")

        values: list[float] = []
        for col_index, value in enumerate(row):
            if isinstance(value, bool) or not isinstance(value, (int, float)):
                raise TypeError(f"vectors[{row_index}][{col_index}] must be numeric")
            number = float(value)
            if not __import__("math").isfinite(number):
                raise ValueError("Vector values must be finite")
            values.append(number)

        if dimension is None:
            dimension = len(values)
        elif len(values) != dimension:
            raise ValueError("All vectors must have the same dimension")

        result.append(values)

    return result


def validate_metadata(
    metadata: Sequence[Mapping[str, Any] | None] | None,
    expected_count: int,
) -> list[dict[str, Any]]:
    if metadata is None:
        return [{} for _ in range(expected_count)]
    if isinstance(metadata, (str, bytes)) or not isinstance(metadata, Sequence):
        raise TypeError("metadata must be a sequence")
    if len(metadata) != expected_count:
        raise ValueError("Metadata count must match vector count")

    result: list[dict[str, Any]] = []
    for index, item in enumerate(metadata):
        if item is None:
            result.append({})
        elif isinstance(item, Mapping):
            result.append(dict(item))
        else:
            raise TypeError(f"metadata[{index}] must be a mapping or None")
    return result


def validate_ids(ids: Sequence[str], expected_count: int) -> list[str]:
    if isinstance(ids, (str, bytes)) or not isinstance(ids, Sequence):
        raise TypeError("ids must be a sequence of strings")
    result = list(ids)
    if len(result) != expected_count:
        raise ValueError("ID count must match vector count")
    if any(not isinstance(item, str) or not item.strip() for item in result):
        raise ValueError("IDs must be non-empty strings")
    if len(set(result)) != len(result):
        raise ValueError("IDs must be unique")
    return result
