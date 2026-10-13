from __future__ import annotations

from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from ai.rag.document_loader import load_document
from ai.rag.ingestion.pipeline import RAGIngestionPipeline
from ai.rag.models import RAGDocument


class RAGSourceIngestion:
    """Load source files or URLs and ingest them through the existing RAG pipeline."""

    def __init__(self, pipeline: RAGIngestionPipeline) -> None:
        if not callable(getattr(pipeline, "ingest", None)):
            raise TypeError("pipeline must implement ingest().")
        self.pipeline = pipeline

    def ingest_source(self, source: str | Path) -> list[RAGDocument]:
        document = load_document(source)
        return self.pipeline.ingest(
            document_id=document.document_id,
            text=document.text,
            metadata=document.metadata,
        )

    def ingest_sources(
        self,
        sources: list[str | Path],
    ) -> list[RAGDocument]:
        if isinstance(sources, (str, bytes)):
            raise TypeError("sources must be a list of file paths or URLs.")

        if not isinstance(sources, list):
            raise TypeError("sources must be a list of file paths or URLs.")

        prepared: list[dict[str, Any]] = []

        # Load and validate all source documents before asking the pipeline
        # to index the batch. The sink's atomicity depends on its implementation.
        for position, source in enumerate(sources):
            if not isinstance(source, (str, Path)):
                raise TypeError(f"Source at position {position} must be a string or Path.")

            if isinstance(source, str) and not source.strip():
                raise ValueError(f"Source at position {position} cannot be empty.")

            document = load_document(source)
            prepared.append(
                {
                    "document_id": document.document_id,
                    "text": document.text,
                    "metadata": dict(document.metadata),
                }
            )

        return self.pipeline.ingest_many(prepared)


__all__ = ["RAGSourceIngestion"]
