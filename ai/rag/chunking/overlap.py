from __future__ import annotations

from collections.abc import Sequence

from ai.rag.chunking.utils import validate_chunk_size


def add_overlap(
    chunks: Sequence[str],
    overlap: int = 150,
    chunk_size: int = 1000,
) -> list[str]:
    """Combine consecutive chunks while retaining a bounded overlap."""
    validate_chunk_size(chunk_size, overlap)

    result: list[str] = []
    previous = ""

    for raw_chunk in chunks:
        chunk = raw_chunk.strip()
        if not chunk:
            continue

        if not previous:
            combined = chunk[:chunk_size]
        else:
            prefix = previous[-overlap:] if overlap else ""
            combined = f"{prefix}{chunk}"
            combined = combined[:chunk_size]

        result.append(combined)
        previous = chunk

    return result


__all__ = ["add_overlap"]
