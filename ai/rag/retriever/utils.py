from __future__ import annotations

import math
from collections.abc import Mapping, Sequence
from typing import Any

from ai.rag.models import RetrievedDocument


def validate_query(query: str) -> str:
    """Validate and normalize a retrieval query."""
    if not isinstance(query, str):
        raise TypeError("query must be a string.")

    normalized = query.strip()
    if not normalized:
        raise ValueError("query cannot be empty.")

    return normalized


def validate_top_k(top_k: int) -> int:
    """Require a positive integer, excluding booleans."""
    if isinstance(top_k, bool) or not isinstance(top_k, int):
        raise TypeError("top_k must be an integer.")

    if top_k < 1:
        raise ValueError("top_k must be at least 1.")

    return top_k


def validate_filters(
    filters: Mapping[str, Any] | None,
) -> dict[str, Any]:
    """Validate metadata filters and return an independent dictionary."""
    if filters is None:
        return {}

    if not isinstance(filters, Mapping):
        raise TypeError("filters must be a mapping or None.")

    normalized: dict[str, Any] = {}

    for key, value in filters.items():
        if not isinstance(key, str) or not key.strip():
            raise ValueError("Filter keys must be non-empty strings.")

        normalized[key] = value

    return normalized


def validate_score(score: float) -> float:
    """Return a finite numeric relevance score."""
    if isinstance(score, bool) or not isinstance(score, (int, float)):
        raise TypeError("score must be a number.")

    normalized = float(score)

    if not math.isfinite(normalized):
        raise ValueError("score must be finite.")

    return normalized


def validate_retrieved_documents(
    results: Sequence[RetrievedDocument],
) -> list[RetrievedDocument]:
    """Validate retrieval results and reject duplicate document IDs."""
    if isinstance(results, (str, bytes)) or not isinstance(results, Sequence):
        raise TypeError("results must be a sequence of RetrievedDocument items.")

    validated: list[RetrievedDocument] = []
    seen_ids: set[str] = set()

    for result in results:
        if not isinstance(result, RetrievedDocument):
            raise TypeError(
                "Every result must be a RetrievedDocument."
            )

        document_id = result.document.document_id

        if document_id in seen_ids:
            raise ValueError(
                f"Duplicate retrieved document ID: {document_id}"
            )

        score = validate_score(result.score)
        seen_ids.add(document_id)

        validated.append(
            RetrievedDocument(
                document=result.document,
                score=score,
                rank=result.rank,
            )
        )

    return validated


def rank_results(
    results: Sequence[RetrievedDocument],
    top_k: int | None = None,
) -> list[RetrievedDocument]:
    """Sort by descending score, preserve tie order, and assign one-based ranks."""
    validated = validate_retrieved_documents(results)

    if top_k is not None:
        validate_top_k(top_k)

    ranked = sorted(
        enumerate(validated),
        key=lambda item: (-item[1].score, item[0]),
    )

    if top_k is not None:
        ranked = ranked[:top_k]

    return [
        RetrievedDocument(
            document=result.document,
            score=result.score,
            rank=rank,
        )
        for rank, (_, result) in enumerate(ranked, start=1)
    ]


__all__ = [
    "rank_results",
    "validate_filters",
    "validate_query",
    "validate_retrieved_documents",
    "validate_score",
    "validate_top_k",
]
