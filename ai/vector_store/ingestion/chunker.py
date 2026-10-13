"""Chunk loaded source text into retrieval-friendly segments."""

from __future__ import annotations

from dataclasses import dataclass

from ai.vector_store.ingestion.utils import (
    normalize_text,
    validate_chunk_settings,
)


@dataclass(frozen=True)
class TextChunk:
    chunk_index: int
    text: str
    start_char: int
    end_char: int


class TextChunker:
    """Create deterministic character-based chunks with optional overlap."""

    def __init__(
        self,
        chunk_size: int = 1200,
        overlap: int = 150,
    ) -> None:
        validate_chunk_settings(chunk_size, overlap)
        self.chunk_size = chunk_size
        self.overlap = overlap

    def split(self, text: str) -> list[TextChunk]:
        normalized = normalize_text(text)
        if not normalized:
            return []

        chunks: list[TextChunk] = []
        step = self.chunk_size - self.overlap

        for start in range(0, len(normalized), step):
            end = min(start + self.chunk_size, len(normalized))
            chunk_text = normalized[start:end].strip()

            if chunk_text:
                # Find the trimmed text's actual range in the normalized source.
                actual_start = normalized.find(chunk_text, start, end)
                actual_end = actual_start + len(chunk_text)
                chunks.append(
                    TextChunk(
                        chunk_index=len(chunks),
                        text=chunk_text,
                        start_char=actual_start,
                        end_char=actual_end,
                    )
                )

            if end >= len(normalized):
                break

        return chunks
