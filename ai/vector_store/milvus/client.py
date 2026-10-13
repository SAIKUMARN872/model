"""Connection management for the Milvus vector database."""

from __future__ import annotations

import os
from typing import Any

from ai.vector_store.milvus.utils import (
    validate_collection_name,
    validate_dimension,
)


class MilvusClient:
    """Manage a Milvus connection and create compatible collections."""

    def __init__(
        self,
        uri: str | None = None,
        *,
        token: str | None = None,
        db_name: str | None = None,
        alias: str = "modelnow",
        connect_timeout: float = 10.0,
    ) -> None:
        self.uri = uri or os.getenv("MILVUS_URI", "http://localhost:19530")
        self.token = token if token is not None else os.getenv("MILVUS_TOKEN")
        self.db_name = db_name or os.getenv("MILVUS_DB_NAME", "default")
        self.alias = alias
        self.connect_timeout = connect_timeout
        self._connected = False
        self._utility: Any = None
        self._collection_class: Any = None

    def connect(self) -> "MilvusClient":
        if self._connected:
            return self

        try:
            from pymilvus import Collection, connections, utility
        except ImportError as exc:
            raise RuntimeError(
                "Milvus SDK is missing. Install it with: pip install pymilvus"
            ) from exc

        options: dict[str, Any] = {
            "alias": self.alias,
            "uri": self.uri,
            "db_name": self.db_name,
            "timeout": self.connect_timeout,
        }
        if self.token:
            options["token"] = self.token

        try:
            connections.connect(**options)
        except Exception as exc:
            raise ConnectionError(
                f"Unable to connect to Milvus at {self.uri}: {exc}"
            ) from exc

        self._utility = utility
        self._collection_class = Collection
        self._connected = True
        return self

    def ensure_connected(self) -> None:
        if not self._connected:
            self.connect()

    def has_collection(self, name: str) -> bool:
        self.ensure_connected()
        return bool(self._utility.has_collection(
            validate_collection_name(name), using=self.alias
        ))

    def get_collection(self, name: str) -> Any:
        self.ensure_connected()
        name = validate_collection_name(name)
        if not self._utility.has_collection(name, using=self.alias):
            raise LookupError(f"Milvus collection {name!r} does not exist")
        return self._collection_class(name, using=self.alias)

    def create_collection(
        self,
        name: str,
        dimension: int,
        *,
        metric_type: str = "COSINE",
        consistency_level: str = "Bounded",
    ) -> Any:
        self.ensure_connected()
        name = validate_collection_name(name)
        dimension = validate_dimension(dimension)

        if self.has_collection(name):
            raise ValueError(f"Milvus collection {name!r} already exists")

        try:
            from pymilvus import CollectionSchema, DataType, FieldSchema

            fields = [
                FieldSchema(
                    name="document_id",
                    dtype=DataType.VARCHAR,
                    is_primary=True,
                    auto_id=False,
                    max_length=512,
                ),
                FieldSchema(
                    name="text",
                    dtype=DataType.VARCHAR,
                    max_length=65535,
                ),
                FieldSchema(
                    name="embedding",
                    dtype=DataType.FLOAT_VECTOR,
                    dim=dimension,
                ),
                FieldSchema(
                    name="metadata",
                    dtype=DataType.JSON,
                ),
            ]
            schema = CollectionSchema(
                fields=fields,
                description="ModelNow vector documents",
                enable_dynamic_field=False,
            )
            collection = self._collection_class(
                name,
                schema=schema,
                using=self.alias,
                consistency_level=consistency_level,
            )
            collection.create_index(
                field_name="embedding",
                index_params={
                    "index_type": "AUTOINDEX",
                    "metric_type": metric_type.upper(),
                    "params": {},
                },
            )
            collection.load()
            return collection
        except Exception:
            # Avoid leaving a half-created collection behind when possible.
            try:
                if self._utility.has_collection(name, using=self.alias):
                    self._utility.drop_collection(name, using=self.alias)
            except Exception:
                pass
            raise

    def list_collections(self) -> list[str]:
        self.ensure_connected()
        return sorted(self._utility.list_collections(using=self.alias))

    def delete_collection(self, name: str) -> None:
        self.ensure_connected()
        name = validate_collection_name(name)
        if self._utility.has_collection(name, using=self.alias):
            self._utility.drop_collection(name, using=self.alias)

    def close(self) -> None:
        if not self._connected:
            return
        try:
            from pymilvus import connections
            connections.disconnect(self.alias)
        finally:
            self._connected = False
            self._utility = None
            self._collection_class = None
