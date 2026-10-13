from __future__ import annotations

from collections.abc import Sequence

from ai.rag.models import RAGDocument
from ai.rag.retriever.retriever import InMemoryRetriever


class KeywordRetriever(InMemoryRetriever):
    """Deterministic keyword-overlap retriever.

    Intended for lightweight retrieval and fallback use. This is not
    semantic embedding search and does not provide persistent storage.
    """

    def __init__(self, documents: Sequence[RAGDocument] = ()) -> None:
        super().__init__(documents)


__all__ = ["KeywordRetriever"]
