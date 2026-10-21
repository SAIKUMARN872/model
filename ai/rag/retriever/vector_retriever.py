from __future__ import annotations

import math
from collections.abc import Mapping, Sequence
from typing import Any, Protocol, runtime_checkable

from ai.rag.models import RAGDocument, RetrievedDocument


@runtime_checkable
class VectorStoreBackend(Protocol):
    """Contract required by the RAG vector retriever."""

    def add_documents(self, documents: Sequence[RAGDocument]) -> None:
        """Add a validated batch of documents to the store."""
        ...

    async def search(
        self,
        query: str,
        top_k: int = 5,
        filters: Mapping[str, Any] | None = None,
    ) -> Sequence[RetrievedDocument]:
        """Perform semantic vector search and return ranked documents."""
        ...


class VectorRetriever:
    """RAG adapter for a semantic vector-store backend.

    The backend owns embeddings, persistence, database operations and
    metadata filtering. This adapter validates requests and results while
    preserving the public RAG Retriever and ingestion contracts.
    """

    def __init__(self, store: VectorStoreBackend) -> None:
        if not callable(getattr(store, "add_documents", None)):
            raise TypeError("Vector store must implement add_documents().")
        if not callable(getattr(store, "search", None)):
            raise TypeError("Vector store must implement search().")

        self.store = store

    def add_documents(self, documents: Sequence[RAGDocument]) -> None:
        records = list(documents)

        if not records:
            return

        if not all(isinstance(item, RAGDocument) for item in records):
            raise TypeError("Every indexed item must be an RAGDocument.")

        ids = [item.document_id for item in records]
        if len(ids) != len(set(ids)):
            raise ValueError("Batch contains duplicate document IDs.")

        # The backend is responsible for validating and safely committing
        # the batch, including handling existing IDs and storage failures.
        self.store.add_documents(records)

    async def retrieve(
        self,
        query: str,
        top_k: int = 5,
        filters: Mapping[str, Any] | None = None,
    ) -> list[RetrievedDocument]:
        if not isinstance(query, str) or not query.strip():
            raise ValueError("Retrieval query cannot be empty.")
        if isinstance(top_k, bool) or not isinstance(top_k, int) or top_k < 1:
            raise ValueError("top_k must be a positive integer.")
        if filters is not None and not isinstance(filters, Mapping):
            raise TypeError("filters must be a mapping or None.")

        results = await self.store.search(
            query=query,
            top_k=top_k,
            filters=filters,
        )

        if isinstance(results, (str, bytes)):
            raise TypeError("Vector store returned an invalid result sequence.")

        validated: list[RetrievedDocument] = []
        seen_ids: set[str] = set()

        for item in results:
            if not isinstance(item, RetrievedDocument):
                raise TypeError(
                    "Vector store results must contain RetrievedDocument items."
                )

            if not math.isfinite(item.score):
                raise ValueError("Vector store returned a non-finite score.")

            document_id = item.document.document_id
            if document_id in seen_ids:
                raise ValueError(
                    f"Vector store returned duplicate document ID: {document_id}"
                )
            seen_ids.add(document_id)
            validated.append(item)

        # The backend must return best matches first. Normalize ranks so
        # downstream consumers receive a consistent one-based rank.
        return [
            RetrievedDocument(
                document=item.document,
                score=item.score,
                rank=rank,
            )
            for rank, item in enumerate(validated[:top_k], start=1)
        ]


__all__ = ["VectorStoreBackend", "VectorRetriever"]
