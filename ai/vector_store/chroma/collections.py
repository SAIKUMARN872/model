"""Collection operations for ModelNow's ChromaDB vector store."""

from collections.abc import Sequence
from typing import Any

from ai.vector_store.exceptions import (
    VectorCollectionNotFoundError,
    VectorDocumentNotFoundError,
    VectorDocumentValidationError,
    VectorStoreOperationError,
)
from ai.vector_store.models import VectorCollectionInfo, VectorDocument


class ChromaCollectionManager:
    """Perform validated CRUD operations on ChromaDB collections."""

    def __init__(self, client: Any) -> None:
        self.client = client

    def get_or_create(self, name: str | None = None) -> Any:
        """Get or create a collection using the configured client."""
        try:
            return self.client.get_or_create_collection(name)
        except Exception as exc:
            raise VectorStoreOperationError(
                f"Could not create or access collection {name!r}"
            ) from exc

    def add_documents(
        self,
        collection_name: str,
        documents: Sequence[VectorDocument],
    ) -> int:
        """Insert documents and return the number inserted."""
        if not documents:
            return 0

        ids: list[str] = []
        texts: list[str] = []
        metadatas: list[dict[str, Any]] = []
        embeddings: list[list[float]] = []
        has_embeddings: bool | None = None

        for document in documents:
            if not isinstance(document, VectorDocument):
                raise VectorDocumentValidationError(
                    "Every item must be a VectorDocument"
                )

            current_has_embedding = document.embedding is not None
            if has_embeddings is None:
                has_embeddings = current_has_embedding
            elif has_embeddings != current_has_embedding:
                raise VectorDocumentValidationError(
                    "Provide embeddings for every document or for none"
                )

            ids.append(document.document_id)
            texts.append(document.text)
            metadatas.append(document.metadata)

            if document.embedding is not None:
                embeddings.append(document.embedding)

        if has_embeddings and len({len(item) for item in embeddings}) != 1:
            raise VectorDocumentValidationError(
                "All document embeddings must have the same dimension"
            )

        collection = self._get_collection(collection_name)

        try:
            arguments: dict[str, Any] = {
                "ids": ids,
                "documents": texts,
                "metadatas": metadatas,
            }
            if has_embeddings:
                arguments["embeddings"] = embeddings

            collection.add(**arguments)
            return len(ids)
        except Exception as exc:
            raise VectorStoreOperationError(
                f"Failed to add documents to {collection_name!r}"
            ) from exc

    def get_document(
        self,
        collection_name: str,
        document_id: str,
    ) -> VectorDocument | None:
        """Retrieve one document by ID."""
        collection = self._get_collection(collection_name)

        try:
            result = collection.get(
                ids=[document_id],
                include=["documents", "metadatas", "embeddings"],
            )
            if not result["ids"]:
                return None

            embedding_data = result.get("embeddings")
            embedding = None
            if embedding_data is not None and len(embedding_data) > 0:
                vector = embedding_data[0]
                if vector is not None:
                    embedding = [float(value) for value in vector]

            return VectorDocument(
                document_id=result["ids"][0],
                text=result["documents"][0] or "",
                metadata=result["metadatas"][0] or {},
                embedding=embedding,
            )
        except Exception as exc:
            raise VectorStoreOperationError(
                f"Failed to retrieve document {document_id!r}"
            ) from exc

    def update_document(
        self,
        collection_name: str,
        document: VectorDocument,
    ) -> None:
        """Update an existing document."""
        collection = self._get_collection(collection_name)

        try:
            existing = collection.get(ids=[document.document_id])
            if not existing["ids"]:
                raise VectorDocumentNotFoundError(
                    f"Document {document.document_id!r} was not found"
                )

            arguments: dict[str, Any] = {
                "ids": [document.document_id],
                "documents": [document.text],
                "metadatas": [document.metadata],
            }
            if document.embedding is not None:
                arguments["embeddings"] = [document.embedding]

            collection.update(**arguments)
        except VectorDocumentNotFoundError:
            raise
        except Exception as exc:
            raise VectorStoreOperationError(
                f"Failed to update document {document.document_id!r}"
            ) from exc

    def delete_documents(
        self,
        collection_name: str,
        document_ids: Sequence[str],
    ) -> int:
        """Delete existing documents and return the number deleted."""
        if not document_ids:
            return 0

        collection = self._get_collection(collection_name)

        try:
            existing = collection.get(ids=list(document_ids))
            found_ids = existing["ids"]
            if found_ids:
                collection.delete(ids=found_ids)
            return len(found_ids)
        except Exception as exc:
            raise VectorStoreOperationError(
                f"Failed to delete documents from {collection_name!r}"
            ) from exc

    def count(self, collection_name: str) -> int:
        """Return the number of documents in a collection."""
        return self._get_collection(collection_name).count()

    def describe(self, collection_name: str) -> VectorCollectionInfo:
        """Return basic information about a collection."""
        collection = self._get_collection(collection_name)

        return VectorCollectionInfo(
            name=collection.name,
            count=collection.count(),
            metadata=collection.metadata or {},
        )

    def _get_collection(self, collection_name: str) -> Any:
        try:
            return self.client.get_collection(collection_name)
        except Exception as exc:
            raise VectorCollectionNotFoundError(
                f"Collection {collection_name!r} was not found"
            ) from exc
