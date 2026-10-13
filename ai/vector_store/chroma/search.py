"""Similarity search operations for ModelNow's ChromaDB vector store."""

import math
from typing import Any

from ai.vector_store.constants import DEFAULT_TOP_K, MAX_TOP_K
from ai.vector_store.exceptions import (
    VectorCollectionNotFoundError,
    VectorDocumentValidationError,
    VectorStoreOperationError,
)
from ai.vector_store.models import VectorDocument, VectorSearchResult


class ChromaSearch:
    """Search stored documents using text or supplied query embeddings."""

    def __init__(self, client: Any) -> None:
        self.client = client

    def search(
        self,
        collection_name: str,
        query: str,
        *,
        top_k: int = DEFAULT_TOP_K,
        filters: dict[str, Any] | None = None,
    ) -> list[VectorSearchResult]:
        """Search using ChromaDB's configured embedding function."""
        if not isinstance(query, str) or not query.strip():
            raise VectorDocumentValidationError(
                "Search query must be a non-empty string"
            )

        self._validate_top_k(top_k)
        collection = self._get_collection(collection_name)

        try:
            arguments: dict[str, Any] = {
                "query_texts": [query],
                "n_results": min(top_k, collection.count()),
                "include": ["documents", "metadatas", "distances", "embeddings"],
            }
            if filters:
                arguments["where"] = filters

            if collection.count() == 0:
                return []

            raw = collection.query(**arguments)
            return self._convert_results(raw)
        except VectorDocumentValidationError:
            raise
        except Exception as exc:
            raise VectorStoreOperationError(
                f"Similarity search failed for {collection_name!r}"
            ) from exc

    def search_by_embedding(
        self,
        collection_name: str,
        query_embedding: list[float],
        *,
        top_k: int = DEFAULT_TOP_K,
        filters: dict[str, Any] | None = None,
    ) -> list[VectorSearchResult]:
        """Search with a query vector produced by ModelNow's embedding engine."""
        if not query_embedding:
            raise VectorDocumentValidationError(
                "Query embedding must not be empty"
            )

        if any(
            not isinstance(value, (int, float))
            or isinstance(value, bool)
            or not math.isfinite(value)
            for value in query_embedding
        ):
            raise VectorDocumentValidationError(
                "Query embedding must contain only finite numbers"
            )

        self._validate_top_k(top_k)
        collection = self._get_collection(collection_name)

        try:
            count = collection.count()
            if count == 0:
                return []

            arguments: dict[str, Any] = {
                "query_embeddings": [[float(value) for value in query_embedding]],
                "n_results": min(top_k, count),
                "include": ["documents", "metadatas", "distances", "embeddings"],
            }
            if filters:
                arguments["where"] = filters

            raw = collection.query(**arguments)
            return self._convert_results(raw)
        except VectorDocumentValidationError:
            raise
        except Exception as exc:
            raise VectorStoreOperationError(
                f"Vector similarity search failed for {collection_name!r}"
            ) from exc

    def _get_collection(self, name: str) -> Any:
        try:
            return self.client.get_collection(name)
        except Exception as exc:
            raise VectorCollectionNotFoundError(
                f"Collection {name!r} was not found"
            ) from exc

    @staticmethod
    def _validate_top_k(top_k: int) -> None:
        if isinstance(top_k, bool) or not isinstance(top_k, int):
            raise VectorDocumentValidationError("top_k must be an integer")
        if not 1 <= top_k <= MAX_TOP_K:
            raise VectorDocumentValidationError(
                f"top_k must be between 1 and {MAX_TOP_K}"
            )

    @staticmethod
    def _convert_results(raw: dict[str, Any]) -> list[VectorSearchResult]:
        ids = (raw.get("ids") or [[]])[0]
        documents = (raw.get("documents") or [[]])[0]
        metadatas = (raw.get("metadatas") or [[]])[0]
        distances = (raw.get("distances") or [[]])[0]
        embeddings = (raw.get("embeddings") or [[]])[0]

        results: list[VectorSearchResult] = []

        for index, document_id in enumerate(ids):
            text = documents[index]
            metadata = metadatas[index] or {}
            distance = float(distances[index]) if distances[index] is not None else 0.0

            embedding = None
            if len(embeddings) > index and embeddings[index] is not None:
                embedding = [float(value) for value in embeddings[index]]

            document = VectorDocument(
                document_id=document_id,
                text=text,
                metadata=metadata,
                embedding=embedding,
            )

            # Chroma distances depend on the collection metric. Convert
            # cosine distance into a similarity score where possible.
            score = max(-1.0, min(1.0, 1.0 - distance)) if distance <= 2.0 else None

            results.append(
                VectorSearchResult(
                    document=document,
                    distance=distance,
                    score=score,
                )
            )

        return results

