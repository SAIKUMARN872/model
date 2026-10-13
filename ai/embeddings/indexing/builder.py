"""Build a vector index from embedding vectors and associated records."""

from collections.abc import Mapping, Sequence
from typing import Any

from .utils import validate_ids, validate_metadata, validate_vectors


class EmbeddingIndexBuilder:
    """Build indexes through an injected index backend.

    The backend must expose add_vectors(ids, vectors, metadata=...).
    No particular vector database is required by this builder.
    """

    def __init__(self, backend: Any):
        if backend is None:
            raise ValueError("An index backend is required")
        if not callable(getattr(backend, "add_vectors", None)):
            raise TypeError("backend must implement add_vectors")
        self.backend = backend

    def build(
        self,
        ids: Sequence[str],
        vectors: Sequence[Sequence[float]],
        metadata: Sequence[Mapping[str, Any] | None] | None = None,
    ) -> dict[str, Any]:
        validated_vectors = validate_vectors(vectors)
        validated_ids = validate_ids(ids, len(validated_vectors))
        validated_metadata = validate_metadata(metadata, len(validated_vectors))

        if not validated_vectors:
            return {
                "count": 0,
                "dimension": 0,
                "ids": [],
            }

        result = self.backend.add_vectors(
            ids=validated_ids,
            vectors=validated_vectors,
            metadata=validated_metadata,
        )

        return {
            "count": len(validated_vectors),
            "dimension": len(validated_vectors[0]),
            "ids": validated_ids,
            "backend_result": result,
        }
