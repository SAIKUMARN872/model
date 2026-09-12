"""
High-level Voyage AI embedding provider.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .client import (
    VoyageClient,
)
from .models import (
    VoyageConfig,
    VoyageEmbedding,
    VoyageEmbeddingResponse,
    VoyageUsage,
)
from .utils import (
    estimate_tokens_batch,
    get_dimensions,
    validate_text,
    validate_texts,
)


@dataclass
class VoyageProvider:
    """
    High-level Voyage embedding provider.

    Compatible with EmbeddingManager,
    IndexBuilder and retrieval components.
    """

    config: VoyageConfig | None = None

    def __post_init__(self) -> None:

        self.config = (
            self.config
            or VoyageConfig()
        )

        self.client = VoyageClient(
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

        return self.client.embed_queries(
            [
                validate_text(query)
            ]
        )[0]

    def embed_queries(
        self,
        queries: list[str],
    ) -> list[list[float]]:

        return self.client.embed_queries(
            validate_texts(queries)
        )

    def embed_document(
        self,
        document: str,
    ) -> list[float]:

        return self.client.embed_documents(
            [
                validate_text(document)
            ]
        )[0]

    def embed_documents(
        self,
        documents: list[str],
    ) -> list[list[float]]:

        return self.client.embed_documents(
            validate_texts(documents)
        )

    def embed_with_usage(
        self,
        texts: list[str],
        input_type: str | None = None,
    ) -> VoyageEmbeddingResponse:

        texts = validate_texts(
            texts
        )

        if input_type == "query":

            vectors = (
                self.embed_queries(
                    texts
                )
            )

        elif input_type == "document":

            vectors = (
                self.embed_documents(
                    texts
                )
            )

        else:

            vectors = self.embed_many(
                texts
            )

        dimensions = get_dimensions(
            vectors
        )

        usage = VoyageUsage(
            input_count=len(texts),
            total_tokens=(
                estimate_tokens_batch(
                    texts
                )
            ),
            dimensions=dimensions,
            model_name=(
                self.config.model_name
            ),
            input_type=input_type,
        )

        return VoyageEmbeddingResponse(
            embeddings=vectors,
            model_name=(
                self.config.model_name
            ),
            usage=usage,
        )

    def embed_objects(
        self,
        texts: list[str],
        input_type: str = "document",
    ) -> list[VoyageEmbedding]:

        texts = validate_texts(
            texts
        )

        if input_type == "query":

            vectors = (
                self.embed_queries(
                    texts
                )
            )

        elif input_type == "document":

            vectors = (
                self.embed_documents(
                    texts
                )
            )

        else:

            raise ValueError(
                "input_type must be "
                "'query' or 'document'"
            )

        dimensions = get_dimensions(
            vectors
        )

        return [
            VoyageEmbedding(
                text=text,
                vector=vector,
                model_name=(
                    self.config.model_name
                ),
                dimensions=dimensions,
                input_type=input_type,
            )
            for text, vector
            in zip(
                texts,
                vectors,
            )
        ]

    def dimension(self) -> int:

        if self.config.output_dimension:

            return self.config.output_dimension

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

        self.client.unload()

    @property
    def loaded(self) -> bool:

        return self.client.loaded