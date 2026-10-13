from __future__ import annotations

from typing import Any

from .models import OpenAIEmbeddingConfig
from .provider import OpenAIEmbeddingProvider


class OpenAIEmbeddingClient:
    """Convenience client wrapper for OpenAI embeddings."""

    def __init__(
        self,
        config: OpenAIEmbeddingConfig | None = None,
        *,
        client: Any = None,
    ) -> None:
        self.provider = OpenAIEmbeddingProvider(config, client=client)

    def embed(self, texts: list[str] | tuple[str, ...]) -> list[list[float]]:
        return self.provider.embed(texts)

    def embed_query(self, text: str) -> list[float]:
        return self.provider.embed_query(text)

    def close(self) -> None:
        self.provider.close()

    def __enter__(self) -> "OpenAIEmbeddingClient":
        self.provider.__enter__()
        return self

    def __exit__(self, exc_type: Any, exc: Any, traceback: Any) -> None:
        self.provider.__exit__(exc_type, exc, traceback)
