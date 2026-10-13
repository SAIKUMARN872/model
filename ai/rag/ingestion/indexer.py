from __future__ import annotations

from collections.abc import Mapping, Sequence
from typing import Any, Protocol, runtime_checkable

from ai.rag.chunking import TextChunker
from ai.rag.ingestion.utils import merge_metadata, validate_document_id
from ai.rag.models import RAGDocument


@runtime_checkable
class DocumentSink(Protocol):
    def add_documents(self, documents: Sequence[RAGDocument]) -> None:
        """Persist documents or raise an exception if indexing fails."""
        ...


class RAGIndexer:
    """Prepare, validate, and index RAG document chunks."""

    def __init__(
        self,
        retriever: DocumentSink,
        chunker: TextChunker | None = None,
    ) -> None:
        if not callable(getattr(retriever, "add_documents", None)):
            raise TypeError("Retriever must implement add_documents().")

        self.retriever = retriever
        self.chunker = chunker or TextChunker()

    def prepare_document(
        self,
        document_id: str,
        text: str,
        metadata: Mapping[str, Any] | None = None,
    ) -> list[RAGDocument]:
        document_id = validate_document_id(document_id)

        if not isinstance(text, str):
            raise TypeError("Document text must be a string.")
        if not text.strip():
            raise ValueError("Document text cannot be empty.")
        if metadata is not None and not isinstance(metadata, Mapping):
            raise TypeError("metadata must be a mapping.")

        chunks = self.chunker.split(text, document_id=document_id)

        return [
            RAGDocument(
                document_id=chunk.chunk_id,
                text=chunk.text,
                metadata=merge_metadata(
                    metadata,
                    {
                        "source_document_id": document_id,
                        "chunk_index": chunk.index,
                        "start_char": chunk.start_char,
                        "end_char": chunk.end_char,
                    },
                ),
            )
            for chunk in chunks
        ]

    def index_prepared_documents(
        self,
        documents: Sequence[RAGDocument],
    ) -> list[RAGDocument]:
        records = list(documents)

        if not records:
            return []

        if not all(isinstance(item, RAGDocument) for item in records):
            raise TypeError("Every indexed item must be an RAGDocument.")

        ids = [item.document_id for item in records]
        if len(ids) != len(set(ids)):
            raise ValueError("Batch contains duplicate chunk IDs.")

        # The sink must validate the batch before committing it. The
        # included InMemoryRetriever does so before extending its records.
        self.retriever.add_documents(records)
        return records

    def index_document(
        self,
        document_id: str,
        text: str,
        metadata: Mapping[str, Any] | None = None,
    ) -> list[RAGDocument]:
        prepared = self.prepare_document(document_id, text, metadata)
        return self.index_prepared_documents(prepared)


__all__ = ["DocumentSink", "RAGIndexer"]
