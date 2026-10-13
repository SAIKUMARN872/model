"""Backend-neutral collection creation."""

from __future__ import annotations

from typing import Any

from ai.vector_store.collections.validator import (
    validate_collection_name,
    validate_dimension,
    validate_metadata,
)
from ai.vector_store.models import VectorCollectionInfo


class CollectionCreator:
    """Create collections using a backend-specific adapter."""

    def __init__(self, backend: Any) -> None:
        self.backend = backend

    def create(
        self,
        name: str,
        dimension: int | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> VectorCollectionInfo:
        name = validate_collection_name(name)
        metadata = validate_metadata(metadata)

        if hasattr(self.backend, "create_collection"):
            if dimension is None:
                raise ValueError(
                    "dimension is required for this collection backend"
                )
            dimension = validate_dimension(dimension)
            created = self.backend.create_collection(name, dimension)
            return VectorCollectionInfo(
                name=created.name if hasattr(created, "name") else name,
                count=0,
                metadata=metadata,
            )

        if hasattr(self.backend, "get_or_create_collection"):
            collection = self.backend.get_or_create_collection(name)
            count = int(collection.count()) if hasattr(collection, "count") else 0
            return VectorCollectionInfo(
                name=name,
                count=count,
                metadata=metadata,
            )

        raise TypeError(
            "Backend must provide create_collection() or get_or_create_collection()"
        )
