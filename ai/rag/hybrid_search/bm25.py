from __future__ import annotations

import math
from collections.abc import Mapping, Sequence
from typing import Any

from ai.rag.models import RAGDocument, RetrievedDocument
from ai.rag.hybrid_search.utils import (
    tokenize,
    validate_filters,
    validate_query,
    validate_top_k,
)


class BM25Retriever:
    """Deterministic BM25 keyword retriever for RAG documents."""

    def __init__(
        self,
        documents: Sequence[RAGDocument] = (),
        *,
        k1: float = 1.5,
        b: float = 0.75,
    ) -> None:
        if isinstance(k1, bool) or not isinstance(k1, (int, float)):
            raise TypeError("k1 must be a number.")
        if not math.isfinite(k1) or k1 <= 0:
            raise ValueError("k1 must be finite and greater than zero.")

        if isinstance(b, bool) or not isinstance(b, (int, float)):
            raise TypeError("b must be a number.")
        if not math.isfinite(b) or not 0 <= b <= 1:
            raise ValueError("b must be between 0 and 1.")

        self.k1 = float(k1)
        self.b = float(b)
        self._documents: list[RAGDocument] = []
        self._tokens: list[list[str]] = []
        self._document_frequency: dict[str, int] = {}
        self._average_length = 0.0

        self.add_documents(documents)

    def add_documents(self, documents: Sequence[RAGDocument]) -> None:
        """Add a batch of documents and rebuild BM25 statistics."""
        incoming = list(documents)

        if not all(isinstance(doc, RAGDocument) for doc in incoming):
            raise TypeError("Every item must be an RAGDocument.")

        incoming_ids = [doc.document_id for doc in incoming]
        if len(incoming_ids) != len(set(incoming_ids)):
            raise ValueError("Incoming document IDs must be unique.")

        existing_ids = {doc.document_id for doc in self._documents}
        duplicates = existing_ids.intersection(incoming_ids)
        if duplicates:
            raise ValueError(
                f"Document IDs already exist: {', '.join(sorted(duplicates))}"
            )

        self._documents.extend(incoming)
        self._rebuild_index()

    def _rebuild_index(self) -> None:
        self._tokens = [tokenize(doc.text) for doc in self._documents]
        self._document_frequency = {}

        for document_tokens in self._tokens:
            for term in set(document_tokens):
                self._document_frequency[term] = (
                    self._document_frequency.get(term, 0) + 1
                )

        total_length = sum(len(tokens) for tokens in self._tokens)
        self._average_length = (
            total_length / len(self._tokens) if self._tokens else 0.0
        )

    def _score(
        self,
        query_tokens: Sequence[str],
        document_tokens: Sequence[str],
    ) -> float:
        """Calculate the standard BM25 score for one document."""
        if not document_tokens or not query_tokens or not self._documents:
            return 0.0

        document_count = len(self._documents)
        document_length = len(document_tokens)
        average_length = self._average_length or 1.0

        frequencies: dict[str, int] = {}
        for term in document_tokens:
            frequencies[term] = frequencies.get(term, 0) + 1

        score = 0.0

        for term in query_tokens:
            term_frequency = frequencies.get(term, 0)
            if term_frequency == 0:
                continue

            document_frequency = self._document_frequency.get(term, 0)

            inverse_document_frequency = math.log(
                1.0
                + (
                    document_count - document_frequency + 0.5
                ) / (document_frequency + 0.5)
            )

            length_normalization = self.k1 * (
                1.0
                - self.b
                + self.b * document_length / average_length
            )

            term_score = (
                inverse_document_frequency
                * term_frequency
                * (self.k1 + 1.0)
                / (term_frequency + length_normalization)
            )
            score += term_score

        return score

    async def retrieve(
        self,
        query: str,
        top_k: int = 5,
        filters: Mapping[str, Any] | None = None,
    ) -> list[RetrievedDocument]:
        """Retrieve BM25-ranked documents using the standard RAG interface."""
        normalized_query = validate_query(query)
        validate_top_k(top_k)
        required_metadata = validate_filters(filters)
        query_tokens = tokenize(normalized_query)

        scored: list[tuple[int, RAGDocument, float]] = []

        for index, document in enumerate(self._documents):
            if any(
                document.metadata.get(key) != value
                for key, value in required_metadata.items()
            ):
                continue

            score = self._score(query_tokens, self._tokens[index])

            if score > 0:
                scored.append((index, document, score))

        scored.sort(key=lambda item: (-item[2], item[0]))

        return [
            RetrievedDocument(
                document=document,
                score=score,
                rank=rank,
            )
            for rank, (_, document, score) in enumerate(
                scored[:top_k], start=1
            )
        ]


__all__ = ["BM25Retriever"]
