"""
Central embedding engine.

This is the main entry point for ModelNow's
embedding subsystem.
"""

from __future__ import annotations

from typing import Any, Iterable

from .constants import (
    DEFAULT_PROVIDER,
    SUPPORTED_METRICS,
)
from .exceptions import (
    EmbeddingDimensionError,
    EmbeddingProviderNotFoundError,
)
from .models import (
    EmbeddingBatch,
    EmbeddingConfig,
    EmbeddingVector,
)
from .similarity import (
    cosine_similarity,
    dot_product,
    euclidean_distance,
)
from .utils import (
    batch_items,
    normalize_embeddings,
    normalize_vector,
    validate_dimensions,
    validate_text,
    validate_texts,
)


class EmbeddingEngine:
    """
    Central orchestration layer for embeddings.

    It can work with any provider implementing the
    ModelNow EmbeddingProvider interface.
    """

    def __init__(
        self,
        manager: Any | None = None,
        config: EmbeddingConfig | None = None,
    ) -> None:

        self.manager = manager

        self.config = (
            config
            or EmbeddingConfig(
                provider=DEFAULT_PROVIDER
            )
        )

        self._providers: dict[
            str,
            Any,
        ] = {}

    # ==========================================================
    # Provider management
    # ==========================================================

    def register_provider(
        self,
        name: str,
        provider: Any,
        overwrite: bool = False,
    ) -> None:

        name = name.strip().lower()

        if (
            name in self._providers
            and not overwrite
        ):

            raise ValueError(
                f"Provider '{name}' is already registered"
            )

        self._providers[
            name
        ] = provider

        if self.manager is not None:

            self.manager.register(
                name,
                provider,
                overwrite=overwrite,
            )

    def get_provider(
        self,
        name: str | None = None,
    ) -> Any:

        provider_name = (
            name
            or self.config.provider
        )

        provider_name = (
            provider_name
            .strip()
            .lower()
        )

        if provider_name in self._providers:

            return self._providers[
                provider_name
            ]

        if self.manager is not None:

            try:

                return self.manager.get(
                    provider_name
                )

            except Exception as exc:

                raise EmbeddingProviderNotFoundError(
                    f"Provider '{provider_name}' "
                    "could not be resolved"
                ) from exc

        raise EmbeddingProviderNotFoundError(
            f"Provider '{provider_name}' "
            "is not registered"
        )

    # ==========================================================
    # Single embedding
    # ==========================================================

    def embed(
        self,
        text: str,
        provider: str | None = None,
    ) -> list[float]:

        text = validate_text(
            text
        )

        selected = self.get_provider(
            provider
        )

        if hasattr(
            selected,
            "embed",
        ):

            vector = selected.embed(
                text
            )

        elif callable(selected):

            vector = selected(
                [text]
            )[0]

        else:

            raise TypeError(
                "Provider does not support embedding"
            )

        vector = [
            float(value)
            for value in vector
        ]

        if self.config.normalize:

            vector = normalize_vector(
                vector
            )

        self._validate_dimensions(
            vector
        )

        return vector

    # ==========================================================
    # Batch embedding
    # ==========================================================

    def embed_many(
        self,
        texts: Iterable[str],
        provider: str | None = None,
    ) -> list[list[float]]:

        texts = validate_texts(
            texts
        )

        selected = self.get_provider(
            provider
        )

        if hasattr(
            selected,
            "embed_many",
        ):

            vectors = selected.embed_many(
                texts
            )

        elif hasattr(
            selected,
            "embed_documents",
        ):

            vectors = selected.embed_documents(
                texts
            )

        elif callable(selected):

            vectors = selected(
                texts
            )

        else:

            raise TypeError(
                "Provider does not support "
                "batch embedding"
            )

        vectors = [
            [
                float(value)
                for value in vector
            ]
            for vector in vectors
        ]

        if len(vectors) != len(texts):

            raise EmbeddingDimensionError(
                "Provider returned an unexpected "
                "number of embeddings"
            )

        if self.config.normalize:

            vectors = normalize_embeddings(
                vectors
            )

        dimensions = validate_dimensions(
            vectors
        )

        if (
            self.config.dimensions
            and dimensions
            != self.config.dimensions
        ):

            raise EmbeddingDimensionError(
                f"Expected "
                f"{self.config.dimensions} dimensions, "
                f"received {dimensions}"
            )

        return vectors

    # ==========================================================
    # Query
    # ==========================================================

    def embed_query(
        self,
        query: str,
        provider: str | None = None,
    ) -> list[float]:

        query = validate_text(
            query
        )

        selected = self.get_provider(
            provider
        )

        if hasattr(
            selected,
            "embed_query",
        ):

            vector = selected.embed_query(
                query
            )

            if self.config.normalize:

                vector = normalize_vector(
                    vector
                )

            return vector

        return self.embed(
            query,
            provider,
        )

    # ==========================================================
    # Documents
    # ==========================================================

    def embed_documents(
        self,
        documents: Iterable[str],
        provider: str | None = None,
    ) -> list[list[float]]:

        documents = validate_texts(
            documents
        )

        selected = self.get_provider(
            provider
        )

        if hasattr(
            selected,
            "embed_documents",
        ):

            vectors = (
                selected.embed_documents(
                    documents
                )
            )

            if self.config.normalize:

                vectors = normalize_embeddings(
                    vectors
                )

            validate_dimensions(
                vectors
            )

            return vectors

        return self.embed_many(
            documents,
            provider,
        )

    # ==========================================================
    # Rich results
    # ==========================================================

    def embed_batch(
        self,
        texts: list[str],
        provider: str | None = None,
    ) -> EmbeddingBatch:

        texts = validate_texts(
            texts
        )

        vectors = self.embed_many(
            texts,
            provider,
        )

        selected_name = (
            provider
            or self.config.provider
        )

        selected = self.get_provider(
            selected_name
        )

        model = getattr(
            selected,
            "model_name",
            self.config.model or "unknown",
        )

        dimensions = validate_dimensions(
            vectors
        )

        return EmbeddingBatch(
            embeddings=vectors,
            model=model,
            provider=selected_name,
            dimensions=dimensions,
            texts=texts,
        )

    def embed_object(
        self,
        text: str,
        provider: str | None = None,
    ) -> EmbeddingVector:

        vector = self.embed(
            text,
            provider,
        )

        selected_name = (
            provider
            or self.config.provider
        )

        selected = self.get_provider(
            selected_name
        )

        model = getattr(
            selected,
            "model_name",
            self.config.model or "unknown",
        )

        return EmbeddingVector(
            vector=vector,
            model=model,
            provider=selected_name,
            dimensions=len(vector),
            text=text,
        )

    # ==========================================================
    # Similarity
    # ==========================================================

    def similarity(
        self,
        vector_a: Iterable[float],
        vector_b: Iterable[float],
        metric: str | None = None,
    ) -> float:

        metric = (
            metric
            or self.config.metric
        ).strip().lower()

        if metric not in SUPPORTED_METRICS:

            raise ValueError(
                f"Unsupported metric '{metric}'"
            )

        if metric == "cosine":

            return cosine_similarity(
                vector_a,
                vector_b,
            )

        if metric in (
            "dot",
            "dot_product",
        ):

            return dot_product(
                vector_a,
                vector_b,
            )

        if metric in (
            "euclidean",
            "l2",
        ):

            distance = euclidean_distance(
                vector_a,
                vector_b,
            )

            return 1.0 / (
                1.0 + distance
            )

        raise ValueError(
            f"Unsupported metric: {metric}"
        )

    # ==========================================================
    # Search scoring
    # ==========================================================

    def rank(
        self,
        query_vector: Iterable[float],
        candidate_vectors: list[
            Iterable[float]
        ],
        metric: str | None = None,
        top_k: int = 10,
    ) -> list[tuple[int, float]]:

        if top_k <= 0:

            raise ValueError(
                "top_k must be positive"
            )

        scores = []

        for index, vector in enumerate(
            candidate_vectors
        ):

            score = self.similarity(
                query_vector,
                vector,
                metric,
            )

            scores.append(
                (
                    index,
                    score,
                )
            )

        scores.sort(
            key=lambda item: item[1],
            reverse=True,
        )

        return scores[
            :top_k
        ]

    # ==========================================================
    # Health
    # ==========================================================

    def health_check(
        self,
        provider: str | None = None,
    ) -> dict[str, Any]:

        selected = self.get_provider(
            provider
        )

        if hasattr(
            selected,
            "health_check",
        ):

            return selected.health_check()

        try:

            vector = self.embed(
                "ModelNow health check",
                provider,
            )

            return {
                "healthy": True,
                "provider": (
                    provider
                    or self.config.provider
                ),
                "dimensions": len(
                    vector
                ),
            }

        except Exception as exc:

            return {
                "healthy": False,
                "error": str(exc),
            }

    def _validate_dimensions(
        self,
        vector: list[float],
    ) -> None:

        dimensions = len(
            vector
        )

        if (
            self.config.dimensions
            and dimensions
            != self.config.dimensions
        ):

            raise EmbeddingDimensionError(
                f"Expected "
                f"{self.config.dimensions} dimensions, "
                f"received {dimensions}"
            )