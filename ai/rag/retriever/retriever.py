from __future__ import annotations

import re
from collections.abc import Mapping, Sequence
from typing import Any

from ai.rag.models import RAGDocument, RetrievedDocument


def _tokens(text: str) -> set[str]:
    return set(re.findall(r"[\w-]+", text.casefold()))


class InMemoryRetriever:
    """Small lexical retriever for development and deterministic testing.

    This is a baseline implementation, not a vector database or embedding
    search engine. Replace it with a vector/hybrid retriever for production.
    """

    def __init__(self, documents: Sequence[RAGDocument] = ()) -> None:
        self._documents: list[RAGDocument] = list(documents)
        self._validate_unique_ids(self._documents)

    @staticmethod
    def _validate_unique_ids(documents: Sequence[RAGDocument]) -> None:
        ids = [document.document_id for document in documents]
        if len(ids) != len(set(ids)):
            raise ValueError("Document IDs must be unique.")

    def add_documents(self, documents: Sequence[RAGDocument]) -> None:
        existing_ids = {document.document_id for document in self._documents}
        incoming_ids = [document.document_id for document in documents]

        if len(incoming_ids) != len(set(incoming_ids)):
            raise ValueError("Incoming document IDs must be unique.")

        duplicates = existing_ids.intersection(incoming_ids)
        if duplicates:
            raise ValueError(
                f"Document IDs already exist: {', '.join(sorted(duplicates))}"
            )

        self._documents.extend(documents)

    async def retrieve(
        self,
        query: str,
        top_k: int = 5,
        filters: Mapping[str, Any] | None = None,
    ) -> list[RetrievedDocument]:
        if not query or not query.strip():
            raise ValueError("Retrieval query cannot be empty.")
        if top_k < 1:
            raise ValueError("top_k must be at least 1.")

        query_tokens = _tokens(query)
        if not query_tokens:
            raise ValueError("Retrieval query must contain searchable tokens.")

        required_metadata = dict(filters or {})
        scored: list[tuple[int, RAGDocument, float]] = []

        for original_index, document in enumerate(self._documents):
            if any(
                document.metadata.get(key) != value
                for key, value in required_metadata.items()
            ):
                continue

            document_tokens = _tokens(document.text)
            if not document_tokens:
                continue

            overlap = query_tokens.intersection(document_tokens)
            if not overlap:
                continue

            score = len(overlap) / len(query_tokens)
            scored.append((original_index, document, score))

        scored.sort(key=lambda item: (-item[2], item[0]))

        return [
            RetrievedDocument(document=document, score=score, rank=rank)
            for rank, (_, document, score) in enumerate(scored[:top_k], start=1)
        ]


__all__ = ["InMemoryRetriever"]

