"""Shared collection-management API for ModelNow vector storage."""

from ai.vector_store.collections.creator import CollectionCreator
from ai.vector_store.collections.manager import CollectionManager
from ai.vector_store.collections.utils import (
    collection_key,
    merge_metadata,
    metadata_from_json,
    metadata_to_json,
)
from ai.vector_store.collections.validator import (
    validate_collection_name,
    validate_dimension,
    validate_metadata,
)

__all__ = [
    "CollectionCreator",
    "CollectionManager",
    "collection_key",
    "merge_metadata",
    "metadata_from_json",
    "metadata_to_json",
    "validate_collection_name",
    "validate_dimension",
    "validate_metadata",
]
