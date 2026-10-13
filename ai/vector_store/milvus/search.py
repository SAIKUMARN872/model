"""Vector similarity search for ModelNow Milvus collections."""

from __future__ import annotations

from typing import Any

from ai.vector_store.milvus.client import MilvusClient
from ai.vector_store.milvus.utils import (
    validate_collection_name,
    validate_embedding,
    validate_metadata,
    validate_top_k,
)


class MilvusSearch:
    def __init__(self, client: MilvusClient) -> None:
        self.client = client

    def search(
        self,
        collection_name: str,
        query_embedding: list[float],
        *,
        top_k: int = 5,
        filters: dict[str, Any] | None = None,
    ) -> list[dict[str, Any]]:
        collection_name = validate_collection_name(collection_name)
        top_k = validate_top_k(top_k)
        filters = validate_metadata(filters)
        collection = self.client.get_collection(collection_name)

        embedding_field = next(
            (field for field in collection.schema.fields
             if field.name == "embedding"),
            None,
        )
        if embedding_field is None:
            raise ValueError("Collection has no embedding field")

        dimension = int(embedding_field.params["dim"])
        vector = validate_embedding(query_embedding, dimension)

        expr = None
        if filters:
            clauses: list[str] = []
            for key, value in filters.items():
                if not key.replace("_", "").isalnum():
                    raise ValueError(f"Invalid metadata filter key: {key!r}")
                import json
                clauses.append(f'metadata["{key}"] == {json.dumps(value)}')
            expr = " and ".join(clauses)

        results = collection.search(
            data=[vector],
            anns_field="embedding",
            param={"metric_type": "COSINE", "params": {}},
            limit=top_k,
            expr=expr,
            output_fields=["document_id", "text", "metadata"],
        )

        matches: list[dict[str, Any]] = []
        for hit in results[0]:
            entity = hit.entity
            matches.append({
                "document_id": entity.get("document_id"),
                "text": entity.get("text"),
                "metadata": entity.get("metadata") or {},
                "distance": float(hit.distance),
                "id": hit.id,
            })
        return matches
