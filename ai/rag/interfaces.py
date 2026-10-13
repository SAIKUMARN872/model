from __future__ import annotations

from collections.abc import Mapping, Sequence
from typing import Any, Protocol, runtime_checkable

from .models import RAGDocument, RetrievedDocument


@runtime_checkable
class Retriever(Protocol):
    async def retrieve(
        self,
        query: str,
        top_k: int = 5,
        filters: Mapping[str, Any] | None = None,
    ) -> Sequence[RetrievedDocument]:
        """Retrieve the most relevant documents for a query."""
        ...


@runtime_checkable
class AnswerGenerator(Protocol):
    async def generate(
        self,
        query: str,
        context: str,
        sources: Sequence[RetrievedDocument],
    ) -> str:
        """Generate an answer grounded in retrieved context."""
        ...


__all__ = ["Retriever", "AnswerGenerator"]
