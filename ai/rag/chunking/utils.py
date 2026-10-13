from __future__ import annotations

import re


def normalize_text(text: str) -> str:
    """Normalize whitespace without changing the document's meaning."""
    if not isinstance(text, str):
        raise TypeError("Text must be a string.")
    return re.sub(r"\s+", " ", text).strip()


def validate_chunk_size(chunk_size: int, overlap: int = 0) -> None:
    if isinstance(chunk_size, bool) or not isinstance(chunk_size, int):
        raise TypeError("chunk_size must be an integer.")
    if chunk_size < 1:
        raise ValueError("chunk_size must be at least 1.")
    if isinstance(overlap, bool) or not isinstance(overlap, int):
        raise TypeError("overlap must be an integer.")
    if overlap < 0:
        raise ValueError("overlap cannot be negative.")
    if overlap >= chunk_size:
        raise ValueError("overlap must be smaller than chunk_size.")


__all__ = ["normalize_text", "validate_chunk_size"]
