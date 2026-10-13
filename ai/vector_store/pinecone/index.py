from .utils import (
    validate_index_name,
    validate_vector,
    validate_vector_id,
    validate_metadata,
)


class PineconeIndex:
    def __init__(self, client, index_name: str | None = None):
        self.client = client
        self.index_name = validate_index_name(
            index_name or client.index_name or ""
        )

    def _index(self):
        return self.client.get_index(self.index_name)

    def upsert(self, vectors: list[dict], *, namespace: str = "") -> int:
        if not isinstance(vectors, list):
            raise ValueError("vectors must be a list.")
        if not vectors:
            return 0

        prepared = []
        seen = set()
        for item in vectors:
            if not isinstance(item, dict):
                raise ValueError("Each vector must be a dictionary.")
            vector_id = validate_vector_id(item.get("id"))
            if vector_id in seen:
                raise ValueError(f"Duplicate vector ID in batch: {vector_id}")
            seen.add(vector_id)
            values = validate_vector(item.get("values"))
            metadata = validate_metadata(item.get("metadata", {}))
            prepared.append(
                {"id": vector_id, "values": values, "metadata": metadata}
            )

        self._index().upsert(vectors=prepared, namespace=namespace)
        return len(prepared)

    def fetch(self, ids: list[str], *, namespace: str = "") -> dict:
        clean_ids = list(dict.fromkeys(validate_vector_id(value) for value in ids))
        if not clean_ids:
            return {}
        response = self._index().fetch(ids=clean_ids, namespace=namespace)
        vectors = getattr(response, "vectors", None)
        if vectors is None and isinstance(response, dict):
            vectors = response.get("vectors", {})
        return vectors or {}

    def update(
        self,
        vector_id: str,
        values: list[float],
        *,
        metadata: dict | None = None,
        namespace: str = "",
    ) -> bool:
        vector_id = validate_vector_id(vector_id)
        values = validate_vector(values)
        metadata = validate_metadata(metadata or {})
        existing = self.fetch([vector_id], namespace=namespace)
        if vector_id not in existing:
            return False
        self._index().upsert(
            vectors=[{"id": vector_id, "values": values, "metadata": metadata}],
            namespace=namespace,
        )
        return True

    def delete(self, ids: list[str], *, namespace: str = "") -> int:
        clean_ids = list(dict.fromkeys(validate_vector_id(value) for value in ids))
        if not clean_ids:
            return 0
        existing = self.fetch(clean_ids, namespace=namespace)
        found = sum(1 for vector_id in clean_ids if vector_id in existing)
        self._index().delete(ids=clean_ids, namespace=namespace)
        return found

    def describe_stats(self) -> dict:
        response = self._index().describe_index_stats()
        if isinstance(response, dict):
            return response
        if hasattr(response, "to_dict"):
            return response.to_dict()
        return {
            "total_vector_count": getattr(response, "total_vector_count", 0),
            "namespaces": getattr(response, "namespaces", {}),
            "dimension": getattr(response, "dimension", None),
        }
