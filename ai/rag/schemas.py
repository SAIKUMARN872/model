"""Typed dictionary schemas for RAG serialization."""

from typing import Any, NotRequired, TypedDict


class DocumentSchema(TypedDict):
    document_id: str
    text: str
    metadata: NotRequired[dict[str, Any]]


class RetrievedDocumentSchema(TypedDict):
    document: DocumentSchema
    score: float
    rank: NotRequired[int]


class RAGRequestSchema(TypedDict):
    query: str
    top_k: NotRequired[int]
    rerank_top_n: NotRequired[int | None]
    min_score: NotRequired[float | None]
    filters: NotRequired[dict[str, Any]]


class RAGResponseSchema(TypedDict):
    query: str
    context: str
    sources: list[RetrievedDocumentSchema]
    answer: NotRequired[str | None]
    metadata: NotRequired[dict[str, Any]]


__all__ = [
    "DocumentSchema",
    "RetrievedDocumentSchema",
    "RAGRequestSchema",
    "RAGResponseSchema",
]
