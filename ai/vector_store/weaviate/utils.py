"""Validation helpers for ModelNow Weaviate integration."""

from __future__ import annotations

import math
from collections.abc import Mapping
from typing import Any


def validate_collection_name(name: str) -> str:
    if not isinstance(name, str) or not name.strip():
        raise ValueError("collection name must be a non-empty string")
    name = name.strip()
    if len(name) > 128 or not name[0].isalpha():
        raise ValueError("collection name must start with a letter and be at most 128 characters")
    if not all(ch.isalnum() or ch == "_" for ch in name):
        raise ValueError("collection name may contain only letters, digits, and underscores")
    return name


def validate_dimension(dimension: int) -> int:
    if isinstance(dimension, bool) or not isinstance(dimension, int):
        raise ValueError("dimension must be an integer")
    if not 1 <= dimension <= 65536:
        raise ValueError("dimension must be between 1 and 65536")
    return dimension


def validate_top_k(top_k: int) -> int:
    if isinstance(top_k, bool) or not isinstance(top_k, int):
        raise ValueError("top_k must be an integer")
    if not 1 <= top_k <= 1000:
        raise ValueError("top_k must be between 1 and 1000")
    return top_k


def validate_vector(vector: Any, dimension: int | None = None) -> list[float]:
    if isinstance(vector, (str, bytes)) or not isinstance(vector, (list, tuple)):
        raise ValueError("vector must be a list or tuple of numbers")
    if not vector:
        raise ValueError("vector must not be empty")
    if dimension is not None and len(vector) != validate_dimension(dimension):
        raise ValueError("vector length does not match dimension")

    result: list[float] = []
    for value in vector:
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError("vector values must be numeric")
        value = float(value)
        if not math.isfinite(value):
            raise ValueError("vector values must be finite")
        result.append(value)
    return result


def validate_metadata(metadata: Mapping[str, Any] | None) -> dict[str, Any]:
    if metadata is None:
        return {}
    if not isinstance(metadata, Mapping):
        raise ValueError("metadata must be a mapping or None")
    return dict(metadata)


def validate_document_id(document_id: str) -> str:
    if not isinstance(document_id, str) or not document_id.strip():
        raise ValueError("document_id must be a non-empty string")
    document_id = document_id.strip()
    if len(document_id) > 512:
        raise ValueError("document_id must be at most 512 characters")
    return document_id


def validate_text(text: str) -> str:
    if not isinstance(text, str) or not text.strip():
        raise ValueError("text must be a non-empty string")
    return text.strip()
