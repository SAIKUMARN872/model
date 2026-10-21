"""Interfaces for ModelNow vector-store implementations."""

from collections.abc import Sequence
from typing import Any, Protocol, runtime_checkable

from ai.vector_store.models import (
    VectorCollectionInfo,
    VectorDocument,
    VectorSearchResult,
)


@runtime_checkable
class VectorStore(Protocol):
    """Contract implemented by vector database adapters."""

    def add_documents(
        self,
        collection_name: str,
        documents: Sequence[VectorDocument],
    ) -> int:
        """Insert or replace documents and return the number processed."""
        ...

    def search(
        self,
        collection_name: str,
        query: str,
        *,
        top_k: int = 5,
        filters: dict[str, Any] | None = None,
    ) -> list[VectorSearchResult]:
        """Return the most relevant documents for a text query."""
        ...

    def get_document(
        self,
        collection_name: str,
        document_id: str,
    ) -> VectorDocument | None:
        """Retrieve one document by its ID."""
        ...

    def update_document(
        self,
        collection_name: str,
        document: VectorDocument,
    ) -> None:
        """Replace an existing document."""
        ...

    def delete_documents(
        self,
        collection_name: str,
        document_ids: Sequence[str],
    ) -> int:
        """Delete documents by ID and return the number deleted."""
        ...

    def list_collections(self) -> list[VectorCollectionInfo]:
        """List available collections."""
        ...

    def delete_collection(self, collection_name: str) -> None:
        """Delete an entire collection."""
        ...
