from __future__ import annotations

from typing import Any

from .models import VoyageEmbeddingConfig
from .provider import VoyageEmbeddingProvider


class VoyageEmbeddingClient:
    """Convenience client wrapper for Voyage embeddings."""

    def __init__(
        self,
        config: VoyageEmbeddingConfig | None = None,
        *,
        client: Any = None,
    ) -> None:
        self.provider = VoyageEmbeddingProvider(config, client=client)

    def embed(self, texts, *, input_type: str = "document"):
        return self.provider.embed(texts, input_type=input_type)

    def embed_query(self, text: str):
        return self.provider.embed_query(text)

    def embed_documents(self, texts):
        return self.provider.embed_documents(texts)

    def close(self) -> None:
        self.provider.close()

    def __enter__(self) -> "VoyageEmbeddingClient":
        self.provider.__enter__()
        return self

    def __exit__(self, exc_type: Any, exc: Any, traceback: Any) -> None:
        self.provider.__exit__(exc_type, exc, traceback)
