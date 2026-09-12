"""
High-level Nomic embedding provider.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .client import NomicClient
from .models import (
    NomicConfig,
    NomicEmbedding,
    NomicEmbeddingResponse,
    NomicUsage,
)
from .utils import (
    estimate_tokens_batch,
    get_dimensions,
    prepare_document,
    prepare_documents,
    prepare_query,
    prepare_queries,
    validate_text,
    validate_texts,
)


@dataclass
class NomicProvider:
    """
    High-level Nomic embedding provider.
    """

    config: NomicConfig | None = None

    def __post_init__(self) -> None:

        self.config = (
            self.config
            or NomicConfig()
        )

        self.client = NomicClient(
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

        prepared = prepare_query(
            query,
            self.config.query_prefix,
        )

        return self.client.encode_one(
            prepared
        )

    def embed_queries(
        self,
        queries: list[str],
    ) -> list[list[float]]:

        prepared = prepare_queries(
            queries,
            self.config.query_prefix,
        )

        return self.client.encode(
            prepared
        )

    def embed_document(
        self,
        document: str,
    ) -> list[float]:

        prepared = prepare_document(
            document,
            self.config.document_prefix,
        )

        return self.client.encode_one(
            prepared
        )

    def embed_documents(
        self,
        documents: list[str],
    ) -> list[list[float]]:

        prepared = prepare_documents(
            documents,
            self.config.document_prefix,
        )

        return self.client.encode(
            prepared
        )

    def embed_with_usage(
        self,
        texts: list[str],
        input_type: str = "document",
    ) -> NomicEmbeddingResponse:

        texts = validate_texts(
            texts
        )

        if input_type == "query":

            prepared = prepare_queries(
                texts,
                self.config.query_prefix,
            )

        elif input_type == "document":

            prepared = prepare_documents(
                texts,
                self.config.document_prefix,
            )

        else:

            raise ValueError(
                "input_type must be "
                "'query' or 'document'"
            )

        embeddings = self.client.encode(
            prepared
        )

        usage = NomicUsage(
            input_count=len(texts),
            estimated_tokens=(
                estimate_tokens_batch(
                    prepared
                )
            ),
            dimensions=get_dimensions(
                embeddings
            ),
            model_name=(
                self.config.model_name
            ),
            input_type=input_type,
        )

        return NomicEmbeddingResponse(
            embeddings=embeddings,
            model_name=(
                self.config.model_name
            ),
            usage=usage,
        )

    def embed_objects(
        self,
        texts: list[str],
        input_type: str = "document",
    ) -> list[NomicEmbedding]:

        if input_type == "query":

            vectors = self.embed_queries(
                texts
            )

        elif input_type == "document":

            vectors = self.embed_documents(
                texts
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
            NomicEmbedding(
                text=text,
                vector=vector,
                model_name=(
                    self.config.model_name
                ),
                dimensions=dimensions,
                input_type=input_type,
                normalized=(
                    self.config.normalize_embeddings
                ),
            )
            for text, vector
            in zip(
                texts,
                vectors,
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