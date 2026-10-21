"""Vector similarity search for Weaviate collections."""

from __future__ import annotations

import json
from collections.abc import Mapping
from typing import Any

from .utils import (
    validate_collection_name,
    validate_metadata,
    validate_top_k,
    validate_vector,
)


class WeaviateSearch:
    def __init__(self, client: Any, collection_name: str = "ModelNowDocument") -> None:
        self.client = client
        self.collection_name = validate_collection_name(collection_name)

    def search(
        self,
        query_vector: list[float] | tuple[float, ...],
        top_k: int = 5,
        filters: Mapping[str, Any] | None = None,
    ) -> list[dict[str, Any]]:
        query_vector = validate_vector(query_vector)
        top_k = validate_top_k(top_k)
        filters = validate_metadata(filters)

        try:
            from weaviate.classes.query import MetadataQuery
        except ImportError as exc:
            raise RuntimeError(
                "Install a compatible client with: pip install weaviate-client"
            ) from exc

        collection = self.client.collections.get(self.collection_name)
        response = collection.query.near_vector(
            near_vector=query_vector,
            limit=top_k,
            return_metadata=MetadataQuery(distance=True, certainty=True),
        )

        results: list[dict[str, Any]] = []
        for obj in getattr(response, "objects", []) or []:
            properties = getattr(obj, "properties", {}) or {}

            try:
                metadata = json.loads(properties.get("metadata_json", "{}"))
            except (TypeError, ValueError):
                metadata = {}

            if not isinstance(metadata, dict):
                metadata = {}

            if any(metadata.get(key) != value for key, value in filters.items()):
                continue

            result_metadata = getattr(obj, "metadata", None)
            distance = getattr(result_metadata, "distance", None)
            certainty = getattr(result_metadata, "certainty", None)

            score = None
            if isinstance(distance, (int, float)):
                score = max(0.0, min(1.0, 1.0 - float(distance)))
            elif isinstance(certainty, (int, float)):
                score = max(0.0, min(1.0, float(certainty)))

            results.append(
                {
                    "document_id": properties.get(
                        "document_id", str(getattr(obj, "uuid", ""))
                    ),
                    "text": properties.get("text", ""),
                    "metadata": metadata,
                    "distance": distance,
                    "certainty": certainty,
                    "score": score,
                    "uuid": str(getattr(obj, "uuid", "")),
                }
            )

        return results[:top_k]
