"""Document indexing orchestration for ModelNow vector stores."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterable

from ai.vector_store.models import VectorDocument
from ai.vector_store.indexing.builder import IndexingDocumentBuilder
from ai.vector_store.indexing.optimizer import IndexingOptimizer
from ai.vector_store.indexing.utils import (
    DEFAULT_BATCH_SIZE,
    validate_batch_size,
    validate_collection_name,
    validate_documents,
)


@dataclass(frozen=True)
class IndexingResult:
    collection_name: str
    input_count: int
    unique_count: int
    indexed_count: int
    batch_count: int
    skipped_duplicates: int


class VectorIndexer:
    """Build, prepare, and submit documents to a vector-store backend."""

    def __init__(
        self,
        backend: Any,
        *,
        builder: IndexingDocumentBuilder | None = None,
        optimizer: IndexingOptimizer | None = None,
        batch_size: int = DEFAULT_BATCH_SIZE,
    ) -> None:
        if not callable(getattr(backend, "add_documents", None)):
            raise TypeError("backend must implement add_documents()")

        self.backend = backend
        self.builder = builder or IndexingDocumentBuilder()
        self.optimizer = optimizer or IndexingOptimizer()
        self.batch_size = validate_batch_size(batch_size)

    def index_documents(
        self,
        collection_name: str,
        documents: Iterable[VectorDocument],
        *,
        deduplicate: bool = True,
    ) -> IndexingResult:
        collection_name = validate_collection_name(collection_name)
        incoming = validate_documents(documents)

        prepared = self.optimizer.prepare(
            incoming,
            batch_size=self.batch_size,
            deduplicate=deduplicate,
        )

        unique_count = sum(len(batch) for batch in prepared)
        indexed_count = 0

        for batch in prepared:
            result = self.backend.add_documents(collection_name, batch)
            if isinstance(result, bool):
                raise TypeError("Backend add_documents() must not return a boolean")
            if isinstance(result, int):
                if result < 0 or result > len(batch):
                    raise ValueError("Backend returned an invalid indexed count")
                indexed_count += result
            else:
                # Some adapters return None on successful writes.
                if result is not None:
                    raise TypeError(
                        "Backend add_documents() must return an integer or None"
                    )
                indexed_count += len(batch)

        return IndexingResult(
            collection_name=collection_name,
            input_count=len(incoming),
            unique_count=unique_count,
            indexed_count=indexed_count,
            batch_count=len(prepared),
            skipped_duplicates=len(incoming) - unique_count,
        )

    def index_texts(
        self,
        collection_name: str,
        texts: Iterable[str],
        *,
        namespace: str = "",
        metadata: dict[str, Any] | None = None,
        deduplicate: bool = True,
    ) -> IndexingResult:
        documents = self.builder.build_many(
            texts,
            namespace=namespace,
            metadata=metadata,
        )
        return self.index_documents(
            collection_name,
            documents,
            deduplicate=deduplicate,
        )

    def index_text_chunks(
        self,
        collection_name: str,
        text: str,
        *,
        document_id: str,
        metadata: dict[str, Any] | None = None,
    ) -> IndexingResult:
        documents = self.builder.build_chunks(
            text,
            document_id=document_id,
            metadata=metadata,
        )
        return self.index_documents(collection_name, documents)
