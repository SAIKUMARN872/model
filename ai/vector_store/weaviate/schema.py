"""Weaviate collection schema and document write operations."""

from __future__ import annotations

import json
import uuid
from collections.abc import Mapping
from typing import Any

from .utils import (
    validate_collection_name,
    validate_dimension,
    validate_document_id,
    validate_metadata,
    validate_text,
    validate_vector,
)

_NAMESPACE = uuid.UUID("c95a16e0-7c8c-4fb4-ae5a-61df1c5bb7d2")


def _uuid_for(document_id: str) -> str:
    return str(uuid.uuid5(_NAMESPACE, document_id))


class WeaviateSchema:
    def __init__(self, client: Any, collection_name: str = "ModelNowDocument") -> None:
        self.client = client
        self.collection_name = validate_collection_name(collection_name)
        self._dimension: int | None = None

    def exists(self) -> bool:
        return bool(self.client.collections.exists(self.collection_name))

    def create(self, dimension: int, recreate: bool = False) -> Any:
        dimension = validate_dimension(dimension)
        collections = self.client.collections

        if collections.exists(self.collection_name):
            if not recreate:
                self._dimension = dimension
                return collections.get(self.collection_name)
            collections.delete(self.collection_name)

        try:
            from weaviate.classes.config import Configure, DataType, Property
        except ImportError as exc:
            raise RuntimeError(
                "Install a compatible client with: pip install weaviate-client"
            ) from exc

        collection = collections.create(
            name=self.collection_name,
            vector_config=Configure.Vectors.self_provided(),
            properties=[
                Property(name="document_id", data_type=DataType.TEXT),
                Property(name="text", data_type=DataType.TEXT),
                Property(name="metadata_json", data_type=DataType.TEXT),
            ],
        )
        self._dimension = dimension
        return collection

    def upsert(
        self,
        document_id: str,
        text: str,
        vector: list[float] | tuple[float, ...],
        metadata: Mapping[str, Any] | None = None,
        dimension: int | None = None,
    ) -> str:
        document_id = validate_document_id(document_id)
        text = validate_text(text)
        metadata = validate_metadata(metadata)
        expected_dimension = dimension or self._dimension
        vector = validate_vector(vector, expected_dimension)

        if self._dimension is None:
            self._dimension = len(vector)
        elif len(vector) != self._dimension:
            raise ValueError("vector dimension does not match collection dimension")

        collection = self.client.collections.get(self.collection_name)
        object_uuid = _uuid_for(document_id)
        properties = {
            "document_id": document_id,
            "text": text,
            "metadata_json": json.dumps(metadata, ensure_ascii=False, default=str),
        }

        # Replace the object if it already exists; otherwise insert it.
        existing = collection.query.fetch_object_by_id(object_uuid)
        if existing is None:
            collection.data.insert(
                uuid=object_uuid,
                properties=properties,
                vector=vector,
            )
        else:
            collection.data.replace(
                uuid=object_uuid,
                properties=properties,
                vector=vector,
            )

        return object_uuid

    def fetch(self, document_id: str) -> dict[str, Any] | None:
        document_id = validate_document_id(document_id)
        collection = self.client.collections.get(self.collection_name)
        result = collection.query.fetch_object_by_id(_uuid_for(document_id))
        if result is None:
            return None

        properties = getattr(result, "properties", {}) or {}
        try:
            metadata = json.loads(properties.get("metadata_json", "{}"))
        except (TypeError, ValueError):
            metadata = {}

        return {
            "document_id": properties.get("document_id", document_id),
            "text": properties.get("text", ""),
            "metadata": metadata if isinstance(metadata, dict) else {},
            "uuid": str(getattr(result, "uuid", _uuid_for(document_id))),
        }

    def delete(self, document_ids: list[str] | tuple[str, ...]) -> int:
        if isinstance(document_ids, (str, bytes)) or not isinstance(document_ids, (list, tuple)):
            raise ValueError("document_ids must be a list or tuple")

        collection = self.client.collections.get(self.collection_name)
        deleted = 0
        for raw_id in document_ids:
            doc_id = validate_document_id(raw_id)
            object_uuid = _uuid_for(doc_id)
            if collection.query.fetch_object_by_id(object_uuid) is not None:
                collection.data.delete_by_id(object_uuid)
                deleted += 1

        return deleted
