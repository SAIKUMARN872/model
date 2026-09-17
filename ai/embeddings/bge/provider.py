"""
BGE embedding provider.
"""

from __future__ import annotations

from typing import Any

from .client import BGEClient
from .models import (
    BGEConfig,
    BGEEmbedding,
    BGEEmbeddingResponse,
)


class BGEProvider:
    """
    High-level BGE embedding provider.
    """

    name = "bge"

    def __init__(
        self,
        config: BGEConfig | None = None,
        client: BGEClient | None = None,
    ) -> None:

        self.config = (
            config
            or BGEConfig()
        )

        self.client = (
            client
            or BGEClient(
                self.config
            )
        )

    @property
    def model_name(self) -> str:
        return self.config.model_name

    def embed(
        self,
        texts: str | list[str],
        metadata: list[
            dict[str, Any]
        ] | None = None,
    ) -> BGEEmbeddingResponse:

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

        vectors = self.client.encode(
            text_list
        )

        dimensions = (
            len(vectors[0])
            if vectors
            else self.config.dimensions
        )

        embeddings = [
            BGEEmbedding(
                text=text,
                vector=vector,
                model=self.model_name,
                dimensions=len(vector),
                metadata=item_metadata,
            )
            for text, vector, item_metadata
            in zip(
                text_list,
                vectors,
                metadata,
            )
        ]

        return BGEEmbeddingResponse(
            embeddings=embeddings,
            model=self.model_name,
            dimensions=dimensions,
            usage={
                "input_texts":
                    len(text_list),
            },
        )

    def embed_one(
        self,
        text: str,
    ) -> list[float]:

        return self.client.encode_one(
            text
        )

    def dimension(self) -> int:

        return self.client.dimension()