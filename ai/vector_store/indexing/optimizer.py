"""Batch preparation and duplicate handling for vector indexing."""

from __future__ import annotations

from collections.abc import Iterable, Iterator

from ai.vector_store.models import VectorDocument
from ai.vector_store.indexing.utils import (
    validate_batch_size,
    validate_documents,
)


class IndexingOptimizer:
    """Prepare predictable batches for vector-store writes."""

    @staticmethod
    def deduplicate(
        documents: Iterable[VectorDocument],
    ) -> list[VectorDocument]:
        """Keep the first document for each ID."""
        validated = validate_documents(documents)
        seen: set[str] = set()
        result: list[VectorDocument] = []

        for document in validated:
            if document.document_id in seen:
                continue
            seen.add(document.document_id)
            result.append(document)

        return result

    @staticmethod
    def batches(
        documents: Iterable[VectorDocument],
        *,
        batch_size: int = 64,
    ) -> Iterator[list[VectorDocument]]:
        size = validate_batch_size(batch_size)
        validated = validate_documents(documents)

        for start in range(0, len(validated), size):
            yield validated[start : start + size]

    @classmethod
    def prepare(
        cls,
        documents: Iterable[VectorDocument],
        *,
        batch_size: int = 64,
        deduplicate: bool = True,
    ) -> list[list[VectorDocument]]:
        validated = validate_documents(documents)
        if deduplicate:
            validated = cls.deduplicate(validated)
        return list(cls.batches(validated, batch_size=batch_size))
