"""
Collection management.
"""

from __future__ import annotations

from .chroma import ChromaVectorStore


class CollectionManager:
    """
    Collection manager.
    """

    def __init__(
        self,
        store: ChromaVectorStore,
    ) -> None:
        self.store = store

    def create(
        self,
        name: str,
    ):
        """
        Create collection.
        """
        return self.store.create_collection(name)

    def get(
        self,
        name: str,
    ):
        """
        Get collection.
        """
        return self.store.get_collection(name)

    def delete(
        self,
        name: str,
    ):
        """
        Delete collection.
        """
        self.store.delete_collection(name)

    def list(
        self,
    ):
        """
        List all collections.
        """
        return self.store.list_collections()