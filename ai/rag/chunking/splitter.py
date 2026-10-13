from __future__ import annotations

from ai.rag.chunking.utils import normalize_text, validate_chunk_size


def split_text(
    text: str,
    chunk_size: int = 1000,
    overlap: int = 150,
) -> list[str]:
    """Split text into overlapping chunks measured in characters."""
    validate_chunk_size(chunk_size, overlap)
    normalized = normalize_text(text)

    if not normalized:
        return []

    chunks: list[str] = []
    start = 0
    length = len(normalized)

    while start < length:
        end = min(start + chunk_size, length)

        if end < length:
            boundary = normalized.rfind(" ", start, end)
            if boundary > start:
                end = boundary

        chunk = normalized[start:end].strip()
        if chunk:
            chunks.append(chunk)

        if end >= length:
            break

        next_start = max(start + 1, end - overlap)

        # Avoid starting the next chunk halfway through a word.
        while next_start < length and normalized[next_start].isspace():
            next_start += 1

        start = next_start

    return chunks


__all__ = ["split_text"]
