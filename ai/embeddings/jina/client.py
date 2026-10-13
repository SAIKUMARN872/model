"""Small client wrapper around the Jina embedding provider."""

from collections.abc import Sequence

from .provider import JinaEmbeddingProvider


class JinaEmbeddingClient:
    def __init__(self, provider: JinaEmbeddingProvider | None = None) -> None:
        self.provider = provider or JinaEmbeddingProvider()

    def embed_documents(self, documents: Sequence[str]) -> list[list[float]]:
        return self.provider.embed_texts(documents)

    def embed_query(self, query: str) -> list[float]:
        return self.provider.embed_query(query)

    def close(self) -> None:
        self.provider.close()

    def __enter__(self) -> "JinaEmbeddingClient":
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> None:
        self.close()
