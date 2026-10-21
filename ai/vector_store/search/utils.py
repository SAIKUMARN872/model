"""Shared utilities for ModelNow vector-store search."""

from __future__ import annotations

import math
from collections.abc import Mapping, Sequence
from typing import Any


def validate_query(query: str) -> str:
    if not isinstance(query, str) or not query.strip():
        raise ValueError("query must be a non-empty string")
    return query.strip()


def validate_top_k(top_k: int) -> int:
    if isinstance(top_k, bool) or not isinstance(top_k, int):
        raise ValueError("top_k must be an integer")
    if not 1 <= top_k <= 1000:
        raise ValueError("top_k must be between 1 and 1000")
    return top_k


def validate_weight(weight: float, name: str = "weight") -> float:
    if isinstance(weight, bool) or not isinstance(weight, (int, float)):
        raise ValueError(f"{name} must be numeric")
    value = float(weight)
    if not math.isfinite(value) or value < 0:
        raise ValueError(f"{name} must be finite and non-negative")
    return value


def normalize_score(score: Any) -> float:
    """Normalize a finite numeric score to the range 0..1."""
    if isinstance(score, bool) or not isinstance(score, (int, float)):
        return 0.0
    value = float(score)
    if not math.isfinite(value):
        return 0.0
    return max(0.0, min(1.0, value))


def document_id(item: Any) -> str | None:
    """Extract a stable ID from a mapping or a document-like object."""
    if isinstance(item, Mapping):
        value = item.get("document_id", item.get("id", item.get("doc_id")))
    else:
        value = getattr(item, "document_id", getattr(item, "id", None))
        if value is None:
            document = getattr(item, "document", None)
            if document is not None:
                value = getattr(document, "document_id", None)

    if value is None:
        return None
    result = str(value).strip()
    return result or None


def result_text(item: Any) -> str:
    if isinstance(item, Mapping):
        value = item.get("text", item.get("content", ""))
        if not value and isinstance(item.get("document"), Mapping):
            value = item["document"].get("text", "")
    else:
        value = getattr(item, "text", getattr(item, "content", ""))
        if not value:
            document = getattr(item, "document", None)
            value = getattr(document, "text", "") if document is not None else ""
    return value if isinstance(value, str) else str(value)


def result_metadata(item: Any) -> dict[str, Any]:
    if isinstance(item, Mapping):
        value = item.get("metadata", {})
        if not value and isinstance(item.get("document"), Mapping):
            value = item["document"].get("metadata", {})
    else:
        value = getattr(item, "metadata", {})
        if not value:
            document = getattr(item, "document", None)
            value = getattr(document, "metadata", {}) if document is not None else {}
    return dict(value) if isinstance(value, Mapping) else {}


def result_score(item: Any) -> float:
    if isinstance(item, Mapping):
        value = item.get("score", item.get("similarity", item.get("relevance_score", 0.0)))
    else:
        value = getattr(item, "score", getattr(item, "similarity", 0.0))
    return normalize_score(value)


def validate_results(results: Sequence[Any]) -> list[Any]:
    if isinstance(results, (str, bytes)) or not isinstance(results, Sequence):
        raise ValueError("search results must be a sequence")
    return list(results)
