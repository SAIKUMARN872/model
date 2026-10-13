"""Validation utilities for ModelNow FAISS."""

from __future__ import annotations

import math
from collections.abc import Sequence

import numpy as np


def validate_collection_name(name: str) -> str:
    if not isinstance(name, str) or not name.strip():
        raise ValueError("Collection name must be a non-empty string")
    return name.strip()


def validate_dimension(dimension: int) -> int:
    if isinstance(dimension, bool) or not isinstance(dimension, int):
        raise TypeError("Embedding dimension must be an integer")
    if dimension <= 0:
        raise ValueError("Embedding dimension must be positive")
    return dimension


def validate_top_k(top_k: int, maximum: int = 100) -> int:
    if isinstance(top_k, bool) or not isinstance(top_k, int):
        raise TypeError("top_k must be an integer")
    if top_k < 1 or top_k > maximum:
        raise ValueError(f"top_k must be between 1 and {maximum}")
    return top_k


def validate_embedding(embedding: Sequence[float]) -> list[float]:
    if isinstance(embedding, (str, bytes)):
        raise TypeError("Embedding must be a sequence of numbers")
    try:
        values = list(embedding)
    except TypeError as exc:
        raise TypeError("Embedding must be iterable") from exc

    if not values:
        raise ValueError("Embedding cannot be empty")

    result: list[float] = []
    for value in values:
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise TypeError("Embedding values must be numeric")
        converted = float(value)
        if not math.isfinite(converted):
            raise ValueError("Embedding values must be finite")
        result.append(converted)

    if not any(value != 0.0 for value in result):
        raise ValueError("Embedding cannot be a zero vector")

    return result


def to_float32_matrix(vectors: Sequence[Sequence[float]], dimension: int) -> np.ndarray:
    validate_dimension(dimension)
    try:
        matrix = np.asarray(vectors, dtype=np.float32)
    except (TypeError, ValueError) as exc:
        raise ValueError("Vectors must contain numeric values") from exc

    if matrix.ndim != 2 or matrix.shape[0] == 0:
        raise ValueError("Vectors must be a non-empty two-dimensional matrix")
    if matrix.shape[1] != dimension:
        raise ValueError(f"Expected vectors of dimension {dimension}")
    if not np.isfinite(matrix).all():
        raise ValueError("Vectors must contain finite values")

    norms = np.linalg.norm(matrix, axis=1)
    if np.any(norms == 0):
        raise ValueError("Zero vectors are not supported")

    matrix = matrix / norms[:, np.newaxis]
    return np.ascontiguousarray(matrix, dtype=np.float32)
