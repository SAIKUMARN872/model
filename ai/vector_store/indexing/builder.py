"""Build searchable VectorDocument objects from raw text."""

from __future__ import annotations

from typing import Any, Iterable

from ai.vector_store.models import VectorDocument
from ai.vector_store.indexing.utils import generate_document_id


class IndexingDocumentBuilder:
    """Convert raw text into validated, consistently identified documents."""

    def __init__(
        self,
        *,
        chunk_size: int = 1200,
        chunk_overlap: int = 150,
    ) -> None:
        if isinstance(chunk_size, bool) or not isinstance(chunk_size, int):
            raise TypeError("chunk_size must be an integer")
        if isinstance(chunk_overlap, bool) or not isinstance(chunk_overlap, int):
            raise TypeError("chunk_overlap must be an integer")
        if chunk_size <= 0:
            raise ValueError("chunk_size must be positive")
        if chunk_overlap < 0 or chunk_overlap >= chunk_size:
            raise ValueError("chunk_overlap must be >= 0 and < chunk_size")

        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def build(
        self,
        text: str,
        *,
        document_id: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> VectorDocument:
        if not isinstance(text, str) or not text.strip():
            raise ValueError("text must be a non-empty string")
        if metadata is not None and not isinstance(metadata, dict):
            raise TypeError("metadata must be a dictionary")

        normalized_text = text.strip()
        resolved_id = document_id or generate_document_id(normalized_text)

        return VectorDocument(
            document_id=resolved_id,
            text=normalized_text,
            metadata=dict(metadata or {}),
        )

    def build_many(
        self,
        texts: Iterable[str],
        *,
        namespace: str = "",
        metadata: dict[str, Any] | None = None,
    ) -> list[VectorDocument]:
        if metadata is not None and not isinstance(metadata, dict):
            raise TypeError("metadata must be a dictionary")

        documents: list[VectorDocument] = []
        for position, text in enumerate(texts):
            document = self.build(
                text,
                document_id=generate_document_id(
                    text, namespace=f"{namespace}:{position}"
                ),
                metadata=metadata,
            )
            documents.append(document)
        return documents

    def build_chunks(
        self,
        text: str,
        *,
        document_id: str,
        metadata: dict[str, Any] | None = None,
    ) -> list[VectorDocument]:
        if not isinstance(text, str) or not text.strip():
            raise ValueError("text must be a non-empty string")
        if not isinstance(document_id, str) or not document_id.strip():
            raise ValueError("document_id must be a non-empty string")
        if metadata is not None and not isinstance(metadata, dict):
            raise TypeError("metadata must be a dictionary")

        source = text.strip()
        step = self.chunk_size - self.chunk_overlap
        chunks: list[VectorDocument] = []

        for start in range(0, len(source), step):
            chunk = source[start : start + self.chunk_size].strip()
            if not chunk:
                continue

            chunk_metadata = dict(metadata or {})
            chunk_metadata["source_document_id"] = document_id
            chunk_metadata["chunk_index"] = len(chunks)

            chunks.append(
                self.build(
                    chunk,
                    document_id=f"{document_id}:chunk:{len(chunks)}",
                    metadata=chunk_metadata,
                )
            )

            if start + self.chunk_size >= len(source):
                break

        return chunks
