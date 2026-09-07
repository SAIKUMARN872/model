"""
Vector database manager.
"""

from __future__ import annotations

from .chroma import ChromaVectorStore
from .embeddings import EmbeddingService


class VectorDBManager:
    """
    High-level manager for vector operations.
    """

    def __init__(self) -> None:
        self.store = ChromaVectorStore()
        self.embedding_service = EmbeddingService()

    async def add_document(
        self,
        collection: str,
        document_id: str,
        text: str,
        metadata: dict | None = None,
    ) -> None:
        """
        Add a document to the vector database.
        """

        embedding = await self.embedding_service.embed_text(
            text
        )

        self.store.add_documents(
            collection_name=collection,
            ids=[document_id],
            documents=[text],
            embeddings=[embedding],
            metadatas=[metadata] if metadata else None,
        )

    async def search(
        self,
        collection: str,
        query: str,
        limit: int = 5,
    ):
        """
        Search for similar documents.
        """

        embedding = await self.embedding_service.embed_text(
            query
        )

        return self.store.query(
            collection_name=collection,
            embedding=embedding,
            limit=limit,
        )

    def delete_document(
        self,
        collection: str,
        document_id: str,
    ) -> None:
        """
        Delete a document.
        """

        self.store.delete(
            collection_name=collection,
            ids=[document_id],
        )

    def create_collection(
        self,
        name: str,
    ):
        """
        Create a collection.
        """

        return self.store.create_collection(name)

    def delete_collection(
        self,
        name: str,
    ) -> None:
        """
        Delete a collection.
        """

        self.store.delete_collection(name)

    def list_collections(
        self,
    ):
        """
        List all collections.
        """

        return self.store.list_collections()