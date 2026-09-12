"""
BGE embedding provider.

Provides a clean application-level interface over BGE models.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .client import (
    BGEClient,
)
from .models import (
    BGEConfig,
    BGEEmbedding,
    BGEEmbeddingResponse,
    BGEUsage,
)
from .utils import (
    build_query_text,
    estimate_tokens_batch,
    get_dimensions,
    prepare_documents,
    validate_text,
)


class BGEProviderError(
    Exception
):
    """Base provider exception."""


@dataclass
class BGEProvider:
    """
    High-level BGE embedding provider.

    Compatible with a batching layer expecting:

        provider(texts) -> list[list[float]]
    """

    config: BGEConfig | None = None

    def __post_init__(self) -> None:

        self.config = (
            self.config
            or BGEConfig()
        )

        self.client = BGEClient(
            self.config
        )

    # --------------------------------------------------
    # Callable interface
    # --------------------------------------------------

    def __call__(
        self,
        texts: list[str],
    ) -> list[list[float]]:

        return self.embed_many(
            texts
        )

    # --------------------------------------------------
    # Embeddings
    # --------------------------------------------------

    def embed(
        self,
        text: str,
    ) -> list[float]:

        text = validate_text(
            text
        )

        return self.client.encode_query(
            text
        )

    def embed_many(
        self,
        texts: list[str],
    ) -> list[list[float]]:

        texts = prepare_documents(
            texts
        )

        return self.client.encode_documents(
            texts
        )

    def embed_query(
        self,
        query: str,
    ) -> list[float]:

        query = validate_text(
            query
        )

        # BGE retrieval models can use a query
        # instruction for better search performance.
        prepared = build_query_text(
            query
        )

        return self.client.encode_query(
            prepared
        )

    def embed_documents(
        self,
        documents: list[str],
    ) -> list[list[float]]:

        return self.embed_many(
            documents
        )

    # --------------------------------------------------
    # Rich responses
    # --------------------------------------------------

    def embed_with_usage(
        self,
        texts: list[str],
    ) -> BGEEmbeddingResponse:

        texts = prepare_documents(
            texts
        )

        embeddings = self.embed_many(
            texts
        )

        usage = BGEUsage(
            input_count=len(
                texts
            ),
            estimated_tokens=(
                estimate_tokens_batch(
                    texts
                )
            ),
            dimensions=get_dimensions(
                embeddings
            ),
            model_name=(
                self.config.model_name
            ),
        )

        return BGEEmbeddingResponse(
            embeddings=embeddings,
            model_name=(
                self.config.model_name
            ),
            usage=usage,
        )

    def embed_objects(
        self,
        texts: list[str],
    ) -> list[BGEEmbedding]:

        texts = prepare_documents(
            texts
        )

        embeddings = self.embed_many(
            texts
        )

        dimensions = get_dimensions(
            embeddings
        )

        return [
            BGEEmbedding(
                text=text,
                vector=embedding,
                model_name=(
                    self.config.model_name
                ),
                dimensions=dimensions,
                normalized=(
                    self.config.normalize_embeddings
                ),
            )
            for text, embedding
            in zip(
                texts,
                embeddings,
            )
        ]

    # --------------------------------------------------
    # Lifecycle
    # --------------------------------------------------

    def load(self) -> None:

        self.client.load()

    def unload(self) -> None:

        self.client.unload()

    @property
    def loaded(self) -> bool:

        return self.client.loaded

    def info(self) -> dict[str, Any]:

        return self.client.info()

    def dimension(self) -> int:

        return self.client.dimension()