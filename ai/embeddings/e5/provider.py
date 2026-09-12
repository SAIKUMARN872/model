"""
High-level E5 embedding provider.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .client import E5Client
from .models import (
    E5Config,
    E5Embedding,
    E5EmbeddingResponse,
    E5Usage,
)
from .utils import (
    cosine_similarity,
    estimate_tokens_batch,
    get_dimensions,
    prepare_passage,
    prepare_passages,
    prepare_query,
    prepare_queries,
    validate_text,
)


class E5ProviderError(
    Exception
):
    """Base E5 provider exception."""


@dataclass
class E5Provider:
    """
    Application-level E5 embedding provider.

    It can be passed directly to the existing
    EmbeddingScheduler because:

        provider(texts)

    returns:

        list[list[float]]
    """

    config: E5Config | None = None

    def __post_init__(self) -> None:

        self.config = (
            self.config
            or E5Config()
        )

        self.client = E5Client(
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
    # Generic embeddings
    # --------------------------------------------------

    def embed(
        self,
        text: str,
    ) -> list[float]:

        text = validate_text(
            text
        )

        return self.client.encode_one(
            text
        )

    def embed_many(
        self,
        texts: list[str],
    ) -> list[list[float]]:

        return self.client.encode_batch(
            texts
        )

    # --------------------------------------------------
    # Query embeddings
    # --------------------------------------------------

    def embed_query(
        self,
        query: str,
    ) -> list[float]:

        prepared = prepare_query(
            query,
            prefix=self.config.query_prefix,
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
            prefix=self.config.query_prefix,
        )

        return self.client.encode_batch(
            prepared
        )

    # --------------------------------------------------
    # Passage/document embeddings
    # --------------------------------------------------

    def embed_document(
        self,
        document: str,
    ) -> list[float]:

        prepared = prepare_passage(
            document,
            prefix=self.config.passage_prefix,
        )

        return self.client.encode_one(
            prepared
        )

    def embed_documents(
        self,
        documents: list[str],
    ) -> list[list[float]]:

        prepared = prepare_passages(
            documents,
            prefix=self.config.passage_prefix,
        )

        return self.client.encode_batch(
            prepared
        )

    # --------------------------------------------------
    # Search
    # --------------------------------------------------

    def search(
        self,
        query: str,
        documents: list[str],
        top_k: int = 5,
    ) -> list[dict[str, Any]]:

        if not documents:
            return []

        if top_k <= 0:
            raise ValueError(
                "top_k must be greater than zero"
            )

        query_vector = self.embed_query(
            query
        )

        document_vectors = (
            self.embed_documents(
                documents
            )
        )

        results = []

        for index, (
            document,
            vector,
        ) in enumerate(
            zip(
                documents,
                document_vectors,
            )
        ):

            score = cosine_similarity(
                query_vector,
                vector,
            )

            results.append(
                {
                    "index": index,
                    "document": document,
                    "score": score,
                    "embedding": vector,
                }
            )

        results.sort(
            key=lambda item: item["score"],
            reverse=True,
        )

        return results[
            :top_k
        ]

    # --------------------------------------------------
    # Rich responses
    # --------------------------------------------------

    def embed_with_usage(
        self,
        texts: list[str],
        input_type: str = "passage",
    ) -> E5EmbeddingResponse:

        if input_type == "query":

            prepared = prepare_queries(
                texts,
                prefix=self.config.query_prefix,
            )

        elif input_type == "passage":

            prepared = prepare_passages(
                texts,
                prefix=self.config.passage_prefix,
            )

        else:

            raise ValueError(
                "input_type must be "
                "'query' or 'passage'"
            )

        embeddings = self.client.encode_batch(
            prepared
        )

        usage = E5Usage(
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

        return E5EmbeddingResponse(
            embeddings=embeddings,
            model_name=(
                self.config.model_name
            ),
            usage=usage,
            metadata={
                "prefix": (
                    self.config.query_prefix
                    if input_type == "query"
                    else self.config.passage_prefix
                )
            },
        )

    def embed_objects(
        self,
        texts: list[str],
        input_type: str = "passage",
    ) -> list[E5Embedding]:

        if input_type == "query":

            prepared = prepare_queries(
                texts,
                prefix=self.config.query_prefix,
            )

        elif input_type == "passage":

            prepared = prepare_passages(
                texts,
                prefix=self.config.passage_prefix,
            )

        else:

            raise ValueError(
                "input_type must be "
                "'query' or 'passage'"
            )

        vectors = self.client.encode_batch(
            prepared
        )

        dimensions = get_dimensions(
            vectors
        )

        return [
            E5Embedding(
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

    def dimension(self) -> int:
        return self.client.dimension()

    def info(self) -> dict[str, Any]:
        return self.client.info()