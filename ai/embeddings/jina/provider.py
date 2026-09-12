"""
High-level Jina embedding provider.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .client import JinaClient
from .models import (
    JinaConfig,
    JinaEmbedding,
    JinaEmbeddingResponse,
    JinaUsage,
)
from .utils import (
    estimate_tokens_batch,
    get_dimensions,
    validate_text,
    validate_texts,
)


@dataclass
class JinaProvider:
    """
    High-level Jina provider.

    Compatible interface:

        embed()
        embed_many()
        embed_query()
        embed_queries()
        embed_document()
        embed_documents()
        __call__()
    """

    config: JinaConfig | None = None

    def __post_init__(self) -> None:

        self.config = (
            self.config
            or JinaConfig()
        )

        self.client = JinaClient(
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

        return self.client.encode_one(
            validate_text(text)
        )

    def embed_many(
        self,
        texts: list[str],
    ) -> list[list[float]]:

        return self.client.encode(
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
    ) -> JinaEmbeddingResponse:

        texts = validate_texts(
            texts
        )

        embeddings = self.embed_many(
            texts
        )

        usage = JinaUsage(
            input_count=len(texts),
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

        return JinaEmbeddingResponse(
            embeddings=embeddings,
            model_name=(
                self.config.model_name
            ),
            usage=usage,
        )

    def embed_objects(
        self,
        texts: list[str],
    ) -> list[JinaEmbedding]:

        texts = validate_texts(
            texts
        )

        embeddings = self.embed_many(
            texts
        )

        dimensions = get_dimensions(
            embeddings
        )

        return [
            JinaEmbedding(
                text=text,
                vector=vector,
                model_name=(
                    self.config.model_name
                ),
                dimensions=dimensions,
                normalized=(
                    self.config.normalize_embeddings
                ),
            )
            for text, vector
            in zip(
                texts,
                embeddings,
            )
        ]

    def load(self) -> None:
        self.client.load()

    def unload(self) -> None:
        self.client.unload()

    @property
    def loaded(self) -> bool:
        return self.client.loaded

    def dimension(self) -> int:
        return self.client.dimension()

    def info(self) -> dict[str, Any]:
        return self.client.info()