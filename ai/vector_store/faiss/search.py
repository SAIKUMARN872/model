"""Vector search adapter for ModelNow FAISS."""

from __future__ import annotations

from typing import Any

from ai.vector_store.exceptions import VectorDocumentValidationError
from ai.vector_store.models import VectorDocument, VectorSearchResult
from ai.vector_store.faiss.client import FaissClient
from ai.vector_store.faiss.utils import validate_top_k


class FaissSearch:
    def __init__(self, client: FaissClient) -> None:
        self.client = client

    def search(
        self,
        collection_name: str,
        query: str,
        *,
        top_k: int = 5,
        filters: dict[str, Any] | None = None,
    ) -> list[VectorSearchResult]:
        raise VectorDocumentValidationError(
            "FAISS requires query embeddings. Use search_by_embedding()."
        )

    def search_by_embedding(
        self,
        collection_name: str,
        query_embedding: list[float],
        *,
        top_k: int = 5,
        filters: dict[str, Any] | None = None,
    ) -> list[VectorSearchResult]:
        top_k = validate_top_k(top_k)
        if filters is not None and not isinstance(filters, dict):
            raise VectorDocumentValidationError("filters must be a dictionary")

        state = self.client.get_collection(collection_name)
        matches = state["index"].search(query_embedding, top_k)
        results: list[VectorSearchResult] = []

        for numeric_id, similarity in matches:
            record = next(
                (
                    item
                    for item in state["documents"].values()
                    if item["numeric_id"] == numeric_id
                ),
                None,
            )
            if record is None:
                continue
            metadata = record.get("metadata", {})
            if filters and any(metadata.get(key) != value for key, value in filters.items()):
                continue

            document = VectorDocument(
                document_id=next(
                    doc_id for doc_id, item in state["documents"].items()
                    if item["numeric_id"] == numeric_id
                ),
                text=record["text"],
                metadata=metadata,
            )
            results.append(
                VectorSearchResult(
                    document=document,
                    distance=1.0 - similarity,
                    score=similarity,
                )
            )
        return results
