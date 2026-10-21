from __future__ import annotations

from ai.rag.models import RetrievedDocument


def validate_max_chars(max_chars: int) -> int:
    """Validate a context character budget."""
    if isinstance(max_chars, bool) or not isinstance(max_chars, int):
        raise TypeError("max_chars must be an integer.")
    if max_chars < 1:
        raise ValueError("max_chars must be at least 1.")
    return max_chars


def format_source_section(item: RetrievedDocument) -> str:
    """Format a retrieved document with its source identifier."""
    return f"[Source: {item.document.document_id}]\n{item.document.text}"


__all__ = ["validate_max_chars", "format_source_section"]
