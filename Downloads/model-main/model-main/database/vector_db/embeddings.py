"""
Embedding generation service.
"""

from __future__ import annotations

from typing import Sequence

from openai import AsyncOpenAI

from app.core.config import settings


class EmbeddingService:
    """
    Service for generating embeddings.
    """

    def __init__(self) -> None:
        self.client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
        )

        self.model = getattr(
            settings,
            "EMBEDDING_MODEL",
            "text-embedding-3-small",
        )

    async def embed_text(
        self,
        text: str,
    ) -> list[float]:
        """
        Generate embedding for a single text.
        """

        response = await self.client.embeddings.create(
            model=self.model,
            input=text,
        )

        return response.data[0].embedding

    async def embed_batch(
        self,
        texts: Sequence[str],
    ) -> list[list[float]]:
        """
        Generate embeddings for multiple texts.
        """

        response = await self.client.embeddings.create(
            model=self.model,
            input=list(texts),
        )

        return [
            item.embedding
            for item in response.data
        ]