"""CRUD operations for ModelNow documents stored in Milvus."""

from __future__ import annotations

from typing import Any, Iterable

from ai.vector_store.milvus.client import MilvusClient
from ai.vector_store.milvus.utils import (
    validate_collection_name,
    validate_embedding,
    validate_metadata,
)


class MilvusCollectionManager:
    def __init__(self, client: MilvusClient) -> None:
        self.client = client

    def create(self, name: str, dimension: int, **kwargs: Any) -> Any:
        return self.client.create_collection(name, dimension, **kwargs)

    def add_documents(
        self,
        collection_name: str,
        documents: Iterable[Any],
    ) -> int:
        collection_name = validate_collection_name(collection_name)
        collection = self.client.get_collection(collection_name)

        ids: list[str] = []
        texts: list[str] = []
        embeddings: list[list[float]] = []
        metadata_values: list[dict[str, Any]] = []

        for document in documents:
            document_id = getattr(document, "document_id", None)
            text = getattr(document, "text", None)
            embedding = getattr(document, "embedding", None)
            metadata = getattr(document, "metadata", None)

            if not isinstance(document_id, str) or not document_id.strip():
                raise ValueError("Each document needs a non-empty document_id")
            if not isinstance(text, str) or not text.strip():
                raise ValueError("Each document needs non-empty text")
            if embedding is None:
                raise ValueError(
                    f"Document {document_id!r} has no embedding; "
                    "generate embeddings before inserting into Milvus"
                )

            ids.append(document_id)
            texts.append(text)
            embeddings.append(validate_embedding(embedding))
            metadata_values.append(validate_metadata(metadata))

        if not ids:
            return 0

        dimensions = {len(vector) for vector in embeddings}
        if len(dimensions) != 1:
            raise ValueError("All embeddings in a batch must have equal dimensions")

        schema_fields = {
            field.name: field
            for field in collection.schema.fields
        }
        expected_dimension = int(
            schema_fields["embedding"].params["dim"]
        )
        if any(len(vector) != expected_dimension for vector in embeddings):
            raise ValueError(
                f"Embedding dimension must be {expected_dimension}"
            )

        collection.insert([
            ids,
            texts,
            embeddings,
            metadata_values,
        ])
        collection.flush()
        return len(ids)

    def get_document(
        self,
        collection_name: str,
        document_id: str,
    ) -> dict[str, Any] | None:
        collection = self.client.get_collection(collection_name)
        escaped_id = document_id.replace("\\", "\\\\").replace('"', '\\"')
        rows = collection.query(
            expr=f'document_id == "{escaped_id}"',
            output_fields=["document_id", "text", "metadata"],
            limit=1,
        )
        return rows[0] if rows else None

    def delete_documents(
        self,
        collection_name: str,
        document_ids: list[str],
    ) -> int:
        if not document_ids:
            return 0
        collection = self.client.get_collection(collection_name)
        escaped = [
            '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'
            for value in document_ids
        ]
        result = collection.delete(
            expr=f"document_id in [{', '.join(escaped)}]"
        )
        collection.flush()
        return int(getattr(result, "delete_count", len(document_ids)))

    def count(self, collection_name: str) -> int:
        collection = self.client.get_collection(collection_name)
        collection.flush()
        return int(collection.num_entities)

    def list_collections(self) -> list[str]:
        return self.client.list_collections()

    def delete_collection(self, collection_name: str) -> None:
        self.client.delete_collection(collection_name)
