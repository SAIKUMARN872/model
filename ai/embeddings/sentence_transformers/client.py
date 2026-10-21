from __future__ import annotations

from typing import Any

from .models import SentenceTransformerConfig
from .provider import SentenceTransformerProvider


class SentenceTransformerClient:
    """Convenience client for text and query embeddings."""

    def __init__(
        self,
        config: SentenceTransformerConfig | None = None,
        *,
        model: Any = None,
    ) -> None:
        self.provider = SentenceTransformerProvider(config, model=model)

    def embed(self, texts: list[str] | tuple[str, ...]) -> list[list[float]]:
        return self.provider.embed(texts)

    def embed_query(self, text: str) -> list[float]:
        return self.provider.embed_query(text)

    @property
    def model_info(self):
        return self.provider.model_info

    def close(self) -> None:
        self.provider.close()

    def __enter__(self) -> "SentenceTransformerClient":
        self.provider.__enter__()
        return self

    def __exit__(self, exc_type, exc, traceback) -> None:
        self.close()
