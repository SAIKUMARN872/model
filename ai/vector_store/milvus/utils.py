"""Validation utilities for the ModelNow Milvus backend."""

from __future__ import annotations

import math
import re
from typing import Any


def validate_collection_name(name: str) -> str:
    if not isinstance(name, str):
        raise TypeError("Collection name must be a string")
    name = name.strip()
    if not name or len(name) > 255:
        raise ValueError("Collection name must contain 1–255 characters")
    if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", name):
        raise ValueError("Invalid Milvus collection name")
    return name


def validate_dimension(dimension: int) -> int:
    if isinstance(dimension, bool) or not isinstance(dimension, int):
        raise TypeError("Dimension must be an integer")
    if dimension <= 0:
        raise ValueError("Dimension must be positive")
    return dimension


def validate_top_k(top_k: int) -> int:
    if isinstance(top_k, bool) or not isinstance(top_k, int):
        raise TypeError("top_k must be an integer")
    if not 1 <= top_k <= 16384:
        raise ValueError("top_k must be between 1 and 16384")
    return top_k


def validate_embedding(embedding: list[float], dimension: int | None = None) -> list[float]:
    if not isinstance(embedding, (list, tuple)) or not embedding:
        raise ValueError("Embedding must be a non-empty list or tuple")

    values = [float(value) for value in embedding]
    if not all(math.isfinite(value) for value in values):
        raise ValueError("Embedding values must be finite")
    if dimension is not None and len(values) != dimension:
        raise ValueError(f"Expected dimension {dimension}, got {len(values)}")
    return values


def validate_metadata(metadata: dict[str, Any] | None) -> dict[str, Any]:
    if metadata is None:
        return {}
    if not isinstance(metadata, dict):
        raise TypeError("Metadata must be a dictionary")
    return dict(metadata)
