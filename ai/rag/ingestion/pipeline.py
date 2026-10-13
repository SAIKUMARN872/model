from __future__ import annotations

from collections.abc import Mapping, Sequence
from typing import Any

from ai.rag.ingestion.indexer import RAGIndexer
from ai.rag.models import RAGDocument


class RAGIngestionPipeline:
    """Validate, prepare, and index one or multiple source documents."""

    def __init__(self, indexer: RAGIndexer) -> None:
        self.indexer = indexer

    def ingest(
        self,
        document_id: str,
        text: str,
        metadata: Mapping[str, Any] | None = None,
    ) -> list[RAGDocument]:
        return self.indexer.index_document(
            document_id=document_id,
            text=text,
            metadata=metadata,
        )

    def ingest_many(
        self,
        documents: Sequence[Mapping[str, Any]],
    ) -> list[RAGDocument]:
        if isinstance(documents, (str, bytes)):
            raise TypeError("documents must be a sequence of document mappings.")

        prepared: list[RAGDocument] = []

        # Validate and prepare the entire batch before writing anything.
        for position, item in enumerate(documents):
            if not isinstance(item, Mapping):
                raise TypeError(f"Document at position {position} must be a mapping.")

            if "document_id" not in item or "text" not in item:
                raise ValueError(
                    f"Document at position {position} requires document_id and text."
                )

            prepared.extend(
                self.indexer.prepare_document(
                    document_id=item["document_id"],
                    text=item["text"],
                    metadata=item.get("metadata"),
                )
            )

        # One sink call avoids partial writes caused by processing each
        # source document separately. Actual atomicity depends on the sink.
        return self.indexer.index_prepared_documents(prepared)


__all__ = ["RAGIngestionPipeline"]
