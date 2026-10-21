from __future__ import annotations

from dataclasses import dataclass

from ai.rag.chunking.overlap import add_overlap
from ai.rag.chunking.splitter import split_text
from ai.rag.chunking.utils import validate_chunk_size


@dataclass(frozen=True, slots=True)
class TextChunk:
    chunk_id: str
    text: str
    index: int
    start_char: int
    end_char: int


class TextChunker:
    """Create stable, ordered text chunks for downstream RAG ingestion."""

    def __init__(
        self,
        chunk_size: int = 1000,
        overlap: int = 150,
    ) -> None:
        validate_chunk_size(chunk_size, overlap)
        self.chunk_size = chunk_size
        self.overlap = overlap

    def split(self, text: str, document_id: str = "document") -> list[TextChunk]:
        if not isinstance(text, str):
            raise TypeError("Document text must be a string.")
        if not document_id or not document_id.strip():
            raise ValueError("document_id cannot be empty.")

        raw_chunks = split_text(
            text,
            chunk_size=self.chunk_size,
            overlap=self.overlap,
        )

        chunks: list[TextChunk] = []
        search_from = 0

        for index, chunk_text in enumerate(raw_chunks):
            start = text.find(chunk_text, search_from)

            # Normalization may change whitespace; use sequential offsets
            # when the normalized chunk cannot be found verbatim.
            if start < 0:
                start = search_from

            end = min(start + len(chunk_text), len(text))
            chunks.append(
                TextChunk(
                    chunk_id=f"{document_id}:{index}",
                    text=chunk_text,
                    index=index,
                    start_char=start,
                    end_char=end,
                )
            )
            search_from = max(start, end - self.overlap)

        return chunks

    def split_with_overlap(self, text: str) -> list[str]:
        chunks = split_text(
            text,
            chunk_size=self.chunk_size,
            overlap=self.overlap,
        )
        return add_overlap(
            chunks,
            overlap=self.overlap,
            chunk_size=self.chunk_size,
        )


__all__ = ["TextChunk", "TextChunker"]
