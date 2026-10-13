"""Persistent ChromaDB client for ModelNow."""

import gc
from pathlib import Path
from typing import Any

import chromadb

from ai.vector_store.constants import (
    DEFAULT_COLLECTION_NAME,
    DEFAULT_DISTANCE_METRIC,
    DEFAULT_PERSIST_DIRECTORY,
    SUPPORTED_DISTANCE_METRICS,
)
from ai.vector_store.exceptions import (
    VectorStoreConfigurationError,
    VectorStoreConnectionError,
)


class ChromaVectorClient:
    """Manage a persistent ChromaDB client and its collections."""

    def __init__(
        self,
        persist_directory: str | Path = DEFAULT_PERSIST_DIRECTORY,
        *,
        default_collection: str = DEFAULT_COLLECTION_NAME,
        distance_metric: str = DEFAULT_DISTANCE_METRIC,
    ) -> None:
        if distance_metric not in SUPPORTED_DISTANCE_METRICS:
            raise VectorStoreConfigurationError(
                f"Unsupported distance metric: {distance_metric!r}"
            )

        if not default_collection or not default_collection.strip():
            raise VectorStoreConfigurationError(
                "default_collection must not be empty"
            )

        self.persist_directory = Path(persist_directory).expanduser().resolve()
        self.default_collection = default_collection
        self.distance_metric = distance_metric
        self._client: Any | None = None

    def connect(self) -> Any:
        """Open or reuse the persistent ChromaDB client."""
        if self._client is not None:
            return self._client

        try:
            self.persist_directory.mkdir(parents=True, exist_ok=True)
            self._client = chromadb.PersistentClient(
                path=str(self.persist_directory)
            )
            return self._client
        except Exception as exc:
            raise VectorStoreConnectionError(
                f"Unable to connect to ChromaDB at {self.persist_directory}"
            ) from exc

    @property
    def client(self) -> Any:
        """Return the active client, connecting lazily if needed."""
        return self.connect()

    def get_or_create_collection(
        self,
        name: str | None = None,
        *,
        metadata: dict[str, Any] | None = None,
    ) -> Any:
        """Get or create a collection with the configured distance metric."""
        collection_name = name or self.default_collection

        if not collection_name.strip():
            raise VectorStoreConfigurationError(
                "Collection name must not be empty"
            )

        collection_metadata = dict(metadata or {})
        collection_metadata.setdefault("hnsw:space", self.distance_metric)

        try:
            return self.client.get_or_create_collection(
                name=collection_name,
                metadata=collection_metadata,
            )
        except Exception as exc:
            raise VectorStoreConnectionError(
                f"Unable to get or create collection {collection_name!r}"
            ) from exc

    def get_collection(self, name: str | None = None) -> Any:
        """Retrieve an existing collection."""
        collection_name = name or self.default_collection

        try:
            return self.client.get_collection(name=collection_name)
        except Exception as exc:
            raise VectorStoreConnectionError(
                f"Unable to access collection {collection_name!r}"
            ) from exc

    def list_collections(self) -> list[Any]:
        """Return all collections in the database."""
        try:
            return list(self.client.list_collections())
        except Exception as exc:
            raise VectorStoreConnectionError(
                "Unable to list ChromaDB collections"
            ) from exc

    def delete_collection(self, name: str) -> None:
        """Delete an existing collection."""
        if not name or not name.strip():
            raise VectorStoreConfigurationError(
                "Collection name must not be empty"
            )

        try:
            self.client.delete_collection(name=name)
        except Exception as exc:
            raise VectorStoreConnectionError(
                f"Unable to delete collection {name!r}"
            ) from exc

    def close(self) -> None:
        """Release wrapper references and request Python cleanup."""
        self._client = None
        gc.collect()
