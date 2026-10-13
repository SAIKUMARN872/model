from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Mapping


@dataclass(frozen=True, slots=True)
class RAGDocument:
    """A document stored in or returned by a RAG retriever."""

    document_id: str
    text: str
    metadata: Mapping[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.document_id.strip():
            raise ValueError("Document ID cannot be empty.")
        if not self.text.strip():
            raise ValueError("Document text cannot be empty.")


@dataclass(frozen=True, slots=True)
class RetrievedDocument:
    """A document together with its retrieval or reranking score."""

    document: RAGDocument
    score: float
    rank: int = 0


@dataclass(frozen=True, slots=True)
class RAGRequest:
    query: str
    top_k: int = 5
    rerank_top_n: int | None = 3
    min_score: float | None = None
    filters: Mapping[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.query.strip():
            raise ValueError("RAG query cannot be empty.")
        if self.top_k < 1:
            raise ValueError("top_k must be at least 1.")
        if self.rerank_top_n is not None and self.rerank_top_n < 1:
            raise ValueError("rerank_top_n must be at least 1 or None.")


@dataclass(frozen=True, slots=True)
class RAGResponse:
    query: str
    context: str
    sources: tuple[RetrievedDocument, ...]
    answer: str | None = None
    metadata: Mapping[str, Any] = field(default_factory=dict)


__all__ = [
    "RAGDocument",
    "RetrievedDocument",
    "RAGRequest",
    "RAGResponse",
]
