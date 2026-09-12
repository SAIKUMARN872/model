"""
Interfaces and protocols for embedding providers.
"""

from __future__ import annotations

from typing import (
    Any,
    Iterable,
    Protocol,
    runtime_checkable,
)


@runtime_checkable
class EmbeddingProvider(
    Protocol
):
    """
    Common interface implemented by all
    embedding providers.
    """

    def embed(
        self,
        text: str,
    ) -> list[float]:
        ...

    def embed_many(
        self,
        texts: list[str],
    ) -> list[list[float]]:
        ...

    def embed_query(
        self,
        query: str,
    ) -> list[float]:
        ...

    def embed_queries(
        self,
        queries: list[str],
    ) -> list[list[float]]:
        ...

    def embed_document(
        self,
        document: str,
    ) -> list[float]:
        ...

    def embed_documents(
        self,
        documents: list[str],
    ) -> list[list[float]]:
        ...

    def dimension(self) -> int:
        ...

    def info(self) -> dict[str, Any]:
        ...


@runtime_checkable
class EmbeddingClient(
    Protocol
):
    """Low-level embedding client."""

    def embed(
        self,
        texts: list[str],
    ) -> list[list[float]]:
        ...

    def load(self) -> Any:
        ...

    def unload(self) -> None:
        ...


class EmbeddingFunction(
    Protocol
):
    """
    Callable embedding function.
    """

    def __call__(
        self,
        texts: Iterable[str],
    ) -> list[list[float]]:
        ...