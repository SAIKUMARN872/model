"""Generic retrieval interface for ModelNow."""

from __future__ import annotations

from collections.abc import Callable, Mapping
from typing import Any

from .filters import matches_filter, validate_filter
from .utils import (
    document_id,
    result_metadata,
    result_score,
    result_text,
    validate_query,
    validate_results,
    validate_top_k,
)


class Retriever:
    """Wrap an injected search function without requiring a live database."""

    def __init__(self, search_fn: Callable[..., Any]) -> None:
        if not callable(search_fn):
            raise ValueError("search_fn must be callable")
        self.search_fn = search_fn

    def retrieve(
        self,
        query: str,
        top_k: int = 5,
        filters: Mapping[str, Any] | None = None,
    ) -> list[dict[str, Any]]:
        query = validate_query(query)
        top_k = validate_top_k(top_k)
        filters = validate_filter(filters)

        response = self.search_fn(
            query=query,
            top_k=top_k,
            filters=filters,
        )
        if isinstance(response, Mapping):
            response = response.get("results", response.get("documents", []))
        results = validate_results(response)

        normalized: list[dict[str, Any]] = []
        for item in results:
            metadata = result_metadata(item)
            if not matches_filter(metadata, filters):
                continue

            doc_id = document_id(item)
            normalized.append(
                {
                    "document_id": doc_id or "text:" + result_text(item).strip(),
                    "text": result_text(item),
                    "metadata": metadata,
                    "score": result_score(item),
                    "raw": item,
                }
            )

        normalized.sort(key=lambda item: (-item["score"], item["document_id"]))
        return normalized[:top_k]

    def retrieve_one(
        self,
        query: str,
        filters: Mapping[str, Any] | None = None,
    ) -> dict[str, Any] | None:
        results = self.retrieve(query=query, top_k=1, filters=filters)
        return results[0] if results else None
