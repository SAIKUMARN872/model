from __future__ import annotations

from math import isfinite

from ai.rag.models import RAGRequest, RetrievedDocument


def validate_rag_request(request: RAGRequest) -> None:
    """Validate the core parameters of a RAG request."""
    if not isinstance(request.query, str) or not request.query.strip():
        raise ValueError("RAG query cannot be empty.")

    if isinstance(request.top_k, bool) or not isinstance(request.top_k, int):
        raise ValueError("top_k must be an integer.")

    if request.top_k < 1:
        raise ValueError("top_k must be at least 1.")

    if request.rerank_top_n is not None:
        if (
            isinstance(request.rerank_top_n, bool)
            or not isinstance(request.rerank_top_n, int)
        ):
            raise ValueError("rerank_top_n must be an integer or None.")

        if request.rerank_top_n < 0:
            raise ValueError("rerank_top_n cannot be negative.")

    if request.min_score is not None:
        if (
            isinstance(request.min_score, bool)
            or not isinstance(request.min_score, (int, float))
        ):
            raise ValueError("min_score must be numeric.")

        if not isfinite(request.min_score):
            raise ValueError("min_score must be finite.")


def build_context(sources: list[RetrievedDocument]) -> str:
    """Format retrieved documents into a source-labelled context string."""
    sections: list[str] = []

    for item in sources:
        sections.append(
            f"[Source: {item.document.document_id}]\n"
            f"{item.document.text}"
        )

    return "\n\n".join(sections)


__all__ = ["validate_rag_request", "build_context"]
