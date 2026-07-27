"""
ChromaDB vector store implementation.
"""

from __future__ import annotations

from chromadb import PersistentClient

from app.core.config import settings


class ChromaVectorStore:
    """
    ChromaDB wrapper.
    """

    def __init__(self) -> None:
        self.client = PersistentClient(
            path=settings.CHROMA_DB_PATH,
        )

    def get_collection(
        self,
        name: str,
    ):
        """
        Get an existing collection.
        """
        return self.client.get_collection(name)

    def create_collection(
        self,
        name: str,
    ):
        """
        Create a collection.
        """
        return self.client.get_or_create_collection(
            name=name
        )

    def delete_collection(
        self,
        name: str,
    ) -> None:
        """
        Delete a collection.
        """
        self.client.delete_collection(name)

    def list_collections(
        self,
    ) -> list:
        """
        List available collections.
        """
        return self.client.list_collections()

    def add_documents(
        self,
        collection_name: str,
        ids: list[str],
        documents: list[str],
        embeddings: list[list[float]],
        metadatas: list[dict] | None = None,
    ) -> None:
        """
        Add documents.
        """

        collection = self.create_collection(
            collection_name
        )

        collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
        )

    def query(
        self,
        collection_name: str,
        embedding: list[float],
        limit: int = 5,
    ):
        """
        Search similar vectors.
        """

        collection = self.get_collection(
            collection_name
        )

        return collection.query(
            query_embeddings=[embedding],
            n_results=limit,
        )

    def delete(
        self,
        collection_name: str,
        ids: list[str],
    ) -> None:
        """
        Delete vectors.
        """

        collection = self.get_collection(
            collection_name,
        )

        collection.delete(ids=ids)