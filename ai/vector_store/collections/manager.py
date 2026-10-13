"""Backend-neutral collection lifecycle management."""

from __future__ import annotations

from typing import Any

from ai.vector_store.collections.creator import CollectionCreator
from ai.vector_store.collections.utils import merge_metadata
from ai.vector_store.collections.validator import validate_collection_name
from ai.vector_store.models import VectorCollectionInfo


class CollectionManager:
    """Manage collection creation, listing, inspection, and deletion."""

    def __init__(self, backend: Any) -> None:
        self.backend = backend
        self.creator = CollectionCreator(backend)
        self._metadata: dict[str, dict[str, Any]] = {}

    def create(
        self,
        name: str,
        dimension: int | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> VectorCollectionInfo:
        info = self.creator.create(name, dimension, metadata)
        self._metadata[info.name] = dict(info.metadata)
        return info

    def get(self, name: str) -> VectorCollectionInfo:
        name = validate_collection_name(name)

        if hasattr(self.backend, "get_collection"):
            state = self.backend.get_collection(name)
            if isinstance(state, dict):
                count = len(state.get("documents", {}))
                metadata = self._metadata.get(name, {})
                return VectorCollectionInfo(name, count, metadata)

            count = int(state.count()) if hasattr(state, "count") else 0
            return VectorCollectionInfo(
                name, count, self._metadata.get(name, {})
            )

        if hasattr(self.backend, "get_or_create_collection"):
            collection = self.backend.get_or_create_collection(name)
            count = int(collection.count())
            return VectorCollectionInfo(
                name, count, self._metadata.get(name, {})
            )

        raise TypeError("Backend does not support collection lookup")

    def list(self) -> list[VectorCollectionInfo]:
        if hasattr(self.backend, "list_collections"):
            collections = self.backend.list_collections()
            result: list[VectorCollectionInfo] = []
            for item in collections:
                if isinstance(item, VectorCollectionInfo):
                    result.append(
                        VectorCollectionInfo(
                            item.name,
                            item.count,
                            self._metadata.get(item.name, item.metadata),
                        )
                    )
                elif isinstance(item, dict):
                    name = item["name"]
                    result.append(
                        VectorCollectionInfo(
                            name,
                            int(item.get("count", 0)),
                            self._metadata.get(name, {}),
                        )
                    )
                else:
                    name = getattr(item, "name", str(item))
                    count = int(item.count()) if hasattr(item, "count") else 0
                    result.append(
                        VectorCollectionInfo(
                            name, count, self._metadata.get(name, {})
                        )
                    )
            return result

        raise TypeError("Backend does not support collection listing")

    def update_metadata(
        self,
        name: str,
        updates: dict[str, Any],
    ) -> VectorCollectionInfo:
        current = self.get(name)
        merged = merge_metadata(current.metadata, updates)
        self._metadata[current.name] = merged
        return VectorCollectionInfo(current.name, current.count, merged)

    def delete(self, name: str) -> None:
        name = validate_collection_name(name)
        if not hasattr(self.backend, "delete_collection"):
            raise TypeError("Backend does not support collection deletion")
        self.backend.delete_collection(name)
        self._metadata.pop(name, None)
