"""
E5 embedding provider.
"""

from __future__ import annotations

from typing import Any

from .client import E5Client
from .models import (
    E5Config,
    E5Embedding,
    E5EmbeddingResponse,
)


class E5Provider:
    """
    High-level E5 provider.

    E5 models distinguish between queries and passages.
    """

    name = "e5"

    def __init__(
        self,
        config: E5Config | None = None,
        client: E5Client | None = None,
    ) -> None:

        self.config = (
            config
            or E5Config()
        )

        self.client = (
            client
            or E5Client(
                self.config
            )
        )

    @property
    def model_name(self) -> str:
        return self.config.model_name

    def _prepare_text(
        self,
        text: str,
        input_type: str,
    ) -> str:

        text = str(text).strip()

        if input_type == "query":

            return (
                self.config.query_prefix
                + text
            )

        if input_type == "passage":

            return (
                self.config.passage_prefix
                + text
            )

        raise ValueError(
            "input_type must be 'query' or 'passage'."
        )

    def embed(
        self,
        texts: str | list[str],
        input_type: str = "passage",
        metadata: list[
            dict[str, Any]
        ] | None = None,
    ) -> E5EmbeddingResponse:

        single = isinstance(
            texts,
            str
        )

        text_list = (
            [texts]
            if single
            else list(texts)
        )

        if metadata is None:
            metadata = [
                {}
                for _ in text_list
            ]

        if len(metadata) != len(
            text_list
        ):
            raise ValueError(
                "metadata length must match texts."
            )

        prepared = [
            self._prepare_text(
                text,
                input_type,
            )
            for text in text_list
        ]

        vectors = self.client.encode(
            prepared
        )

        dimensions = (
            len(vectors[0])
            if vectors
            else self.config.dimensions
        )

        embeddings = [
            E5Embedding(
                text=text,
                vector=vector,
                model=self.model_name,
                dimensions=len(vector),
                input_type=input_type,
                metadata=item_metadata,
            )
            for text, vector, item_metadata
            in zip(
                text_list,
                vectors,
                metadata,
            )
        ]

        return E5EmbeddingResponse(
            embeddings=embeddings,
            model=self.model_name,
            dimensions=dimensions,
            usage={
                "input_texts":
                    len(text_list),
            },
        )

    def embed_query(
        self,
        text: str,
    ) -> list[float]:

        prepared = self._prepare_text(
            text,
            "query",
        )

        return self.client.encode_one(
            prepared
        )

    def embed_passage(
        self,
        text: str,
    ) -> list[float]:

        prepared = self._prepare_text(
            text,
            "passage",
        )

        return self.client.encode_one(
            prepared
        )

    def dimension(self) -> int:

        return self.client.dimension()