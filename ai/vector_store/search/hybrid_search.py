"""Backend-independent hybrid retrieval using weighted reciprocal-rank fusion."""

from __future__ import annotations

from collections.abc import Callable, Mapping
from typing import Any

from .filters import matches_filter, validate_filter
from .utils import (
    document_id,
    result_metadata,
    result_text,
    validate_query,
    validate_results,
    validate_top_k,
    validate_weight,
)


class HybridSearch:
    def __init__(
        self,
        semantic_search: Callable[..., Any],
        keyword_search: Callable[..., Any],
        semantic_weight: float = 0.7,
        keyword_weight: float = 0.3,
        rrf_k: int = 60,
    ) -> None:
        if not callable(semantic_search) or not callable(keyword_search):
            raise ValueError("both search adapters must be callable")
        self.semantic_search = semantic_search
        self.keyword_search = keyword_search
        self.semantic_weight = validate_weight(semantic_weight, "semantic_weight")
        self.keyword_weight = validate_weight(keyword_weight, "keyword_weight")
        if self.semantic_weight + self.keyword_weight <= 0:
            raise ValueError("at least one search weight must be positive")
        if isinstance(rrf_k, bool) or not isinstance(rrf_k, int) or rrf_k < 1:
            raise ValueError("rrf_k must be a positive integer")
        self.rrf_k = rrf_k

    @staticmethod
    def _items(response: Any) -> list[Any]:
        if isinstance(response, Mapping):
            response = response.get("results", response.get("documents", []))
        return validate_results(response)

    def search(
        self,
        query: str,
        top_k: int = 5,
        filters: Mapping[str, Any] | None = None,
    ) -> list[dict[str, Any]]:
        query = validate_query(query)
        top_k = validate_top_k(top_k)
        filters = validate_filter(filters)

        semantic = self._items(
            self.semantic_search(query=query, top_k=top_k, filters=filters)
        )
        keyword = self._items(
            self.keyword_search(query=query, top_k=top_k, filters=filters)
        )

        fused: dict[str, dict[str, Any]] = {}

        for source_name, results, weight in (
            ("semantic", semantic, self.semantic_weight),
            ("keyword", keyword, self.keyword_weight),
        ):
            if weight == 0:
                continue
            for rank, item in enumerate(results, start=1):
                doc_id = document_id(item)
                text = result_text(item)
                if doc_id is None:
                    # Deterministic fallback when an adapter supplies no ID.
                    doc_id = "text:" + text.strip()
                if not doc_id:
                    continue

                metadata = result_metadata(item)
                if not matches_filter(metadata, filters):
                    continue

                entry = fused.setdefault(
                    doc_id,
                    {
                        "document_id": doc_id,
                        "text": text,
                        "metadata": metadata,
                        "score": 0.0,
                        "sources": [],
                        "source_scores": {},
                    },
                )
                entry["score"] += weight / (self.rrf_k + rank)
                if source_name not in entry["sources"]:
                    entry["sources"].append(source_name)
                entry["source_scores"][source_name] = 1.0 / rank

                if not entry["text"] and text:
                    entry["text"] = text
                if not entry["metadata"] and metadata:
                    entry["metadata"] = metadata

        total_weight = self.semantic_weight + self.keyword_weight
        for entry in fused.values():
            entry["score"] = round(entry["score"] / total_weight, 8)

        ranked = sorted(
            fused.values(),
            key=lambda item: (-item["score"], item["document_id"]),
        )
        return ranked[:top_k]
