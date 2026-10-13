from .utils import (
    validate_collection_name,
    validate_top_k,
    validate_vector,
    validate_metadata,
)


class QdrantSearch:
    def __init__(self, client):
        self.client = client

    def search(
        self,
        collection_name: str,
        query_vector,
        *,
        dimension: int,
        top_k: int = 5,
        filters: dict | None = None,
        with_vectors: bool = False,
    ) -> list[dict]:
        from qdrant_client.models import Filter, FieldCondition, MatchValue

        name = validate_collection_name(collection_name)
        vector = validate_vector(query_vector, dimension)
        top_k = validate_top_k(top_k)
        filters = validate_metadata(filters)

        query_filter = None
        if filters:
            conditions = [
                FieldCondition(
                    key=f"metadata.{key}",
                    match=MatchValue(value=value),
                )
                for key, value in filters.items()
            ]
            query_filter = Filter(must=conditions)

        response = self.client.ensure_connected().query_points(
            collection_name=name,
            query=vector,
            query_filter=query_filter,
            limit=top_k,
            with_payload=True,
            with_vectors=with_vectors,
        )

        results = []
        for point in response.points:
            payload = point.payload or {}
            result = {
                "document_id": payload.get("document_id", str(point.id)),
                "text": payload.get("text", ""),
                "metadata": payload.get("metadata") or {},
                "score": float(point.score),
            }
            if with_vectors:
                result["vector"] = point.vector
            results.append(result)

        return results
