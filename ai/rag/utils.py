"""Shared validation and utility functions for RAG."""

from __future__ import annotations

import hashlib
import json
import math
import re
from collections.abc import Mapping
from typing import Any

from ai.rag.constants import DEFAULT_TOP_K, MAX_QUERY_LENGTH, MAX_TOP_K
from ai.rag.exceptions import RAGValidationError


def normalize_text(text: str) -> str:
    if not isinstance(text, str):
        raise RAGValidationError("Text must be a string.")
    return re.sub(r"\s+", " ", text).strip()


def validate_query(query: str) -> str:
    if not isinstance(query, str):
        raise RAGValidationError("Query must be a string.")

    query = query.strip()

    if not query:
        raise RAGValidationError("Query cannot be empty.")
    if len(query) > MAX_QUERY_LENGTH:
        raise RAGValidationError("Query exceeds the maximum allowed length.")
    if not any(character.isalnum() for character in query):
        raise RAGValidationError("Query must contain searchable characters.")

    return query


def validate_top_k(top_k: int = DEFAULT_TOP_K) -> int:
    if isinstance(top_k, bool) or not isinstance(top_k, int):
        raise RAGValidationError("top_k must be an integer.")
    if not 1 <= top_k <= MAX_TOP_K:
        raise RAGValidationError(
            f"top_k must be between 1 and {MAX_TOP_K}."
        )
    return top_k


def validate_score(score: float, *, name: str = "score") -> float:
    if isinstance(score, bool) or not isinstance(score, (int, float)):
        raise RAGValidationError(f"{name} must be numeric.")

    result = float(score)

    if not math.isfinite(result):
        raise RAGValidationError(f"{name} must be finite.")

    return result


def metadata_matches(
    metadata: Mapping[str, Any],
    filters: Mapping[str, Any] | None = None,
) -> bool:
    if not isinstance(metadata, Mapping):
        raise RAGValidationError("Metadata must be a mapping.")
    if filters is None:
        return True
    if not isinstance(filters, Mapping):
        raise RAGValidationError("Filters must be a mapping.")

    return all(metadata.get(key) == value for key, value in filters.items())


def stable_hash(value: str | Mapping[str, Any]) -> str:
    if isinstance(value, str):
        serialized = value
    elif isinstance(value, Mapping):
        try:
            serialized = json.dumps(
                value,
                sort_keys=True,
                separators=(",", ":"),
                ensure_ascii=False,
            )
        except (TypeError, ValueError) as exc:
            raise RAGValidationError(
                "Mapping must contain JSON-serializable values."
            ) from exc
    else:
        raise RAGValidationError(
            "Hash input must be a string or mapping."
        )

    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


__all__ = [
    "normalize_text",
    "validate_query",
    "validate_top_k",
    "validate_score",
    "metadata_matches",
    "stable_hash",
]
