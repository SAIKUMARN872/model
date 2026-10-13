from __future__ import annotations

from typing import Any

from .models import NomicConfig
from .provider import NomicEmbeddingProvider


class NomicEmbeddingClient:
    """Small client wrapper for Nomic local embedding inference."""

    def __init__(
        self,
        config: NomicConfig | None = None,
        *,
        model: Any = None,
    ) -> None:
        self.provider = NomicEmbeddingProvider(config, model=model)

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return self.provider.embed_documents(texts)

    def embed_query(self, text: str) -> list[float]:
        return self.provider.embed_query(text)

    def embed_queries(self, texts: list[str]) -> list[list[float]]:
        return self.provider.embed_queries(texts)

    @property
    def model_info(self):
        return self.provider.model_info

    def close(self) -> None:
        self.provider.close()

    def __enter__(self) -> "NomicEmbeddingClient":
        self.provider.__enter__()
        return self

    def __exit__(self, exc_type, exc, traceback) -> None:
        self.close()
