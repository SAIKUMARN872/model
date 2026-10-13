from __future__ import annotations

from typing import Any, Mapping, Sequence

from ..models import RAGResponse


def build_response(
    query: str,
    context: str,
    sources: Sequence[Any],
    answer: str | None = None,
    metadata: Mapping[str, Any] | None = None,
) -> RAGResponse:
    if not isinstance(query, str) or not query.strip():
        raise ValueError("query must not be empty")

    if not isinstance(context, str):
        raise TypeError("context must be a string")

    if answer is not None and not isinstance(answer, str):
        raise TypeError("answer must be a string or None")

    return RAGResponse(
        query=query.strip(),
        context=context,
        sources=list(sources),
        answer=answer.strip() if answer is not None else None,
        metadata=dict(metadata or {}),
    )
