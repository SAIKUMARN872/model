import json
import struct

from .utils import (
    validate_index_name,
    validate_top_k,
    validate_vector,
    validate_metadata,
)


class RedisVectorSearch:
    def __init__(self, client, index_name: str = "modelnow_vectors"):
        self.client = client
        self.index_name = validate_index_name(index_name)

    @staticmethod
    def _encode_vector(vector):
        return struct.pack(f"<{len(vector)}f", *vector)

    def search(
        self,
        query_vector,
        *,
        dimension: int,
        top_k: int = 5,
        filters: dict | None = None,
    ) -> list[dict]:
        from redis.commands.search.query import Query

        vector = validate_vector(query_vector, dimension)
        top_k = validate_top_k(top_k)
        filters = validate_metadata(filters)

        # Exact metadata filtering is applied after vector retrieval.
        query = (
            Query("*=>[KNN $K @embedding $BLOB AS vector_distance]")
            .sort_by("vector_distance")
            .paging(0, min(max(top_k * 10, top_k), 1000))
            .return_fields(
                "document_id",
                "text",
                "metadata_json",
                "vector_distance",
            )
            .dialect(2)
        )

        response = self.client.ensure_connected().ft(self.index_name).search(
            query,
            query_params={
                "K": top_k,
                "BLOB": self._encode_vector(vector),
            },
        )

        results = []
        for item in response.docs:
            metadata = json.loads(getattr(item, "metadata_json", "{}") or "{}")
            if any(metadata.get(key) != value for key, value in filters.items()):
                continue

            distance = float(getattr(item, "vector_distance", 0.0))
            results.append(
                {
                    "document_id": item.document_id,
                    "text": item.text,
                    "metadata": metadata,
                    "distance": distance,
                    "score": 1.0 - distance,
                }
            )
            if len(results) >= top_k:
                break

        return results
