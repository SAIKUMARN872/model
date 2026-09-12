"""
High-level OpenAI embedding provider.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .client import (
    OpenAIClient,
)
from .models import (
    OpenAIEmbeddingConfig,
    OpenAIEmbeddingResponse,
)
from .utils import (
    estimate_tokens_batch,
    get_dimensions,
    validate_text,
    validate_texts,
)


@dataclass
class OpenAIEmbeddingProvider:
    """
    OpenAI embedding provider.

    Compatible with ModelNow's EmbeddingManager
    and IndexBuilder.
    """

    config: OpenAIEmbeddingConfig | None = None

    def __post_init__(self) -> None:

        self.config = (
            self.config
            or OpenAIEmbeddingConfig()
        )

        self.client = OpenAIClient(
            self.config
        )

    def __call__(
        self,
        texts: list[str],
    ) -> list[list[float]]:

        return self.embed_many(
            texts
        )

    def embed(
        self,
        text: str,
    ) -> list[float]:

        return self.client.embed(
            [
                validate_text(text)
            ]
        )[0]

    def embed_many(
        self,
        texts: list[str],
    ) -> list[list[float]]:

        return self.client.embed(
            validate_texts(texts)
        )

    def embed_query(
        self,
        query: str,
    ) -> list[float]:

        return self.embed(
            query
        )

    def embed_queries(
        self,
        queries: list[str],
    ) -> list[list[float]]:

        return self.embed_many(
            queries
        )

    def embed_document(
        self,
        document: str,
    ) -> list[float]:

        return self.embed(
            document
        )

    def embed_documents(
        self,
        documents: list[str],
    ) -> list[list[float]]:

        return self.embed_many(
            documents
        )

    def embed_with_usage(
        self,
        texts: list[str],
    ) -> OpenAIEmbeddingResponse:

        texts = validate_texts(
            texts
        )

        embeddings = self.embed_many(
            texts
        )

        dimensions = get_dimensions(
            embeddings
        )

        return OpenAIEmbeddingResponse(
            embeddings=embeddings,
            model=(
                self.config.model_name
            ),
            dimensions=dimensions,
            input_count=len(texts),
            usage_tokens=(
                estimate_tokens_batch(
                    texts
                )
            ),
        )

    def dimension(self) -> int:

        if self.config.dimensions:

            return self.config.dimensions

        return len(
            self.embed(
                "dimension test"
            )
        )

    def info(self) -> dict[str, Any]:

        return self.client.info()

    def load(self) -> None:

        self.client.load()

    def unload(self) -> None:

        self.client._client = None