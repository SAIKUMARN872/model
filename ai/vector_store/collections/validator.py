"""Validation rules for ModelNow vector collections."""

from __future__ import annotations

import math
import re
from typing import Any


def validate_collection_name(name: str) -> str:
    if not isinstance(name, str):
        raise TypeError("Collection name must be a string")
    name = name.strip()
    if not name:
        raise ValueError("Collection name cannot be empty")
    if len(name) > 128:
        raise ValueError("Collection name cannot exceed 128 characters")
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]*", name):
        raise ValueError(
            "Collection name may contain letters, numbers, dots, underscores, and hyphens"
        )
    if name in {".", ".."}:
        raise ValueError("Invalid collection name")
    return name


def validate_dimension(dimension: int) -> int:
    if isinstance(dimension, bool) or not isinstance(dimension, int):
        raise TypeError("Embedding dimension must be an integer")
    if dimension <= 0:
        raise ValueError("Embedding dimension must be positive")
    return dimension


def validate_metadata(metadata: dict[str, Any] | None) -> dict[str, Any]:
    if metadata is None:
        return {}
    if not isinstance(metadata, dict):
        raise TypeError("Collection metadata must be a dictionary")

    for key, value in metadata.items():
        if not isinstance(key, str) or not key.strip():
            raise ValueError("Metadata keys must be non-empty strings")
        if not isinstance(value, (str, int, float, bool)):
            raise TypeError(f"Unsupported metadata value for {key!r}")
        if isinstance(value, float) and not math.isfinite(value):
            raise ValueError(f"Metadata value for {key!r} must be finite")

    return dict(metadata)
