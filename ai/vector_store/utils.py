"""Shared validation helpers for the ModelNow vector-store engine."""

from __future__ import annotations

import math
from collections.abc import Mapping
from typing import Any


def validate_backend_name(value: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError("backend must be a non-empty string")
    return value.strip().lower()


def validate_collection_name(value: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError("collection_name must be a non-empty string")
    value = value.strip()
    if len(value) > 128:
        raise ValueError("collection_name must not exceed 128 characters")
    return value


def validate_dimension(value: int | None) -> int | None:
    if value is None:
        return None
    if isinstance(value, bool) or not isinstance(value, int):
        raise ValueError("dimension must be an integer or None")
    if not 1 <= value <= 65536:
        raise ValueError("dimension must be between 1 and 65536")
    return value


def validate_top_k(value: int) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        raise ValueError("top_k must be an integer")
    if not 1 <= value <= 1000:
        raise ValueError("top_k must be between 1 and 1000")
    return value


def validate_vector(
    vector: list[float] | tuple[float, ...],
    dimension: int | None = None,
) -> list[float]:
    if isinstance(vector, (str, bytes)) or not isinstance(vector, (list, tuple)):
        raise ValueError("vector must be a list or tuple")
    if not vector:
        raise ValueError("vector must not be empty")
    if dimension is not None and len(vector) != dimension:
        raise ValueError("vector length does not match configured dimension")

    normalized = []
    for value in vector:
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError("vector values must be numeric")
        value = float(value)
        if not math.isfinite(value):
            raise ValueError("vector values must be finite")
        normalized.append(value)
    return normalized


def validate_document_id(value: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError("document_id must be a non-empty string")
    value = value.strip()
    if len(value) > 512:
        raise ValueError("document_id must not exceed 512 characters")
    return value


def validate_metadata(value: Mapping[str, Any] | None) -> dict[str, Any]:
    if value is None:
        return {}
    if not isinstance(value, Mapping):
        raise ValueError("metadata must be a mapping or None")
    return dict(value)


def validate_text(value: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError("text must be a non-empty string")
    return value.strip()
