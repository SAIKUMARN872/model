"""Shared utilities for ModelNow's ChromaDB vector store."""

import math
from typing import Any

from ai.vector_store.exceptions import VectorDocumentValidationError


def validate_collection_name(name: str) -> str:
    """Validate and return a collection name."""
    if not isinstance(name, str) or not name.strip():
        raise VectorDocumentValidationError(
            "Collection name must be a non-empty string"
        )
    return name.strip()


def validate_top_k(top_k: int, maximum: int = 100) -> int:
    """Validate a search result limit."""
    if isinstance(top_k, bool) or not isinstance(top_k, int):
        raise VectorDocumentValidationError("top_k must be an integer")
    if not 1 <= top_k <= maximum:
        raise VectorDocumentValidationError(
            f"top_k must be between 1 and {maximum}"
        )
    return top_k


def validate_embedding(embedding: Any) -> list[float]:
    """Validate and normalize a one-dimensional numeric embedding."""
    if embedding is None or isinstance(embedding, (str, bytes)):
        raise VectorDocumentValidationError(
            "Embedding must be a non-empty numeric sequence"
        )

    try:
        values = list(embedding)
    except TypeError as exc:
        raise VectorDocumentValidationError(
            "Embedding must be a numeric sequence"
        ) from exc

    if not values:
        raise VectorDocumentValidationError("Embedding cannot be empty")

    result: list[float] = []
    for value in values:
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise VectorDocumentValidationError(
                "Embedding values must be numeric"
            )
        converted = float(value)
        if not math.isfinite(converted):
            raise VectorDocumentValidationError(
                "Embedding values must be finite"
            )
        result.append(converted)

    return result


def validate_metadata_filter(filters: dict[str, Any] | None) -> dict[str, Any] | None:
    """Validate a basic ChromaDB metadata filter."""
    if filters is None:
        return None

    if not isinstance(filters, dict) or not filters:
        raise VectorDocumentValidationError(
            "Metadata filters must be a non-empty dictionary or None"
        )

    for key, value in filters.items():
        if not isinstance(key, str) or not key.strip():
            raise VectorDocumentValidationError(
                "Metadata filter keys must be non-empty strings"
            )
        if isinstance(value, (dict, list, tuple, set)) or value is None:
            raise VectorDocumentValidationError(
                f"Invalid metadata filter value for {key!r}"
            )
        if not isinstance(value, (str, int, float, bool)):
            raise VectorDocumentValidationError(
                f"Unsupported metadata filter value for {key!r}"
            )

    return dict(filters)
