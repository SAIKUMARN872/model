from __future__ import annotations

import asyncio
import math
from collections.abc import Mapping, Sequence
from threading import RLock
from typing import Any, Protocol

from ai.rag.models import RAGDocument, RetrievedDocument


class EmbeddingModel(Protocol):
    """Minimal interface required from an embedding model."""

    def encode(
        self,
        sentences: list[str],
        *,
        convert_to_numpy: bool = True,
        normalize_embeddings: bool = True,
        show_progress_bar: bool = False,
    ) -> Any:
        ...


class SentenceTransformerVectorStore:
    """In-memory semantic vector store backed by sentence-transformers."""

    def __init__(
        self,
        model_name: str = "sentence-transformers/all-MiniLM-L6-v2",
        *,
        model: EmbeddingModel | None = None,
    ) -> None:
        if not isinstance(model_name, str) or not model_name.strip():
            raise ValueError("model_name cannot be empty.")

        if model is None:
            try:
                from sentence_transformers import SentenceTransformer
            except ImportError as exc:
                raise ImportError(
                    "Install sentence-transformers to use semantic retrieval."
                ) from exc

            model = SentenceTransformer(model_name)

        if not callable(getattr(model, "encode", None)):
            raise TypeError("model must implement encode().")

        self.model = model
        self.model_name = model_name
        self._documents: list[RAGDocument] = []
        self._embeddings: list[list[float]] = []
        self._embedding_dimension: int | None = None
        self._lock = RLock()

    def _encode(self, texts: list[str]) -> list[list[float]]:
        import numpy as np

        vectors = self.model.encode(
            texts,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False,
        )
        matrix = np.asarray(vectors, dtype=float)

        if matrix.ndim == 1 and len(texts) == 1:
            matrix = matrix.reshape(1, -1)

        if matrix.ndim != 2 or matrix.shape[0] != len(texts):
            raise ValueError("Embedding model returned an invalid shape.")

        if matrix.shape[1] == 0:
            raise ValueError("Embedding vectors cannot be empty.")

        if not np.isfinite(matrix).all():
            raise ValueError("Embedding model returned non-finite values.")

        norms = np.linalg.norm(matrix, axis=1)
        if np.any(norms == 0):
            raise ValueError("Embedding model returned a zero vector.")

        # Normalize defensively, even if the model ignores the option.
        matrix = matrix / norms[:, None]
        return matrix.tolist()

    def add_documents(self, documents: Sequence[RAGDocument]) -> None:
        """Embed and add a batch of documents without replacing existing IDs."""
        incoming = list(documents)

        if not all(isinstance(doc, RAGDocument) for doc in incoming):
            raise TypeError("Every item must be an RAGDocument.")

        if not incoming:
            return

        incoming_ids = [doc.document_id for doc in incoming]
        if len(incoming_ids) != len(set(incoming_ids)):
            raise ValueError("Incoming document IDs must be unique.")

        with self._lock:
            existing_ids = {doc.document_id for doc in self._documents}
            duplicates = existing_ids.intersection(incoming_ids)
            if duplicates:
                raise ValueError(
                    "Document IDs already exist: "
                    + ", ".join(sorted(duplicates))
                )

            vectors = self._encode([doc.text for doc in incoming])
            dimension = len(vectors[0])

            if any(len(vector) != dimension for vector in vectors):
                raise ValueError("Embedding dimensions are inconsistent.")

            if (
                self._embedding_dimension is not None
                and dimension != self._embedding_dimension
            ):
                raise ValueError("Embedding dimension does not match the index.")

            self._documents.extend(incoming)
            self._embeddings.extend(vectors)
            self._embedding_dimension = dimension

    async def search(
        self,
        query: str,
        top_k: int = 5,
        filters: Mapping[str, Any] | None = None,
    ) -> list[RetrievedDocument]:
        """Return documents ranked by cosine similarity."""
        if not isinstance(query, str) or not query.strip():
            raise ValueError("Search query cannot be empty.")

        if isinstance(top_k, bool) or not isinstance(top_k, int) or top_k < 1:
            raise ValueError("top_k must be a positive integer.")

        if filters is not None and not isinstance(filters, Mapping):
            raise TypeError("filters must be a mapping or None.")

        query_vectors = await asyncio.to_thread(self._encode, [query.strip()])
        query_vector = query_vectors[0]

        with self._lock:
            records = list(zip(self._documents, self._embeddings))

        scored: list[tuple[int, RAGDocument, float]] = []

        for index, (document, embedding) in enumerate(records):
            if len(query_vector) != len(embedding):
                raise ValueError("Query and document embedding dimensions differ.")

            if any(
                document.metadata.get(key) != value
                for key, value in (filters or {}).items()
            ):
                continue

            score = sum(
                query_value * document_value
                for query_value, document_value in zip(
                    query_vector, embedding
                )
            )

            if not math.isfinite(score):
                raise ValueError("Cosine similarity must be finite.")

            # Normalized vectors produce cosine similarity in [-1, 1].
            score = max(-1.0, min(1.0, score))
            scored.append((index, document, score))

        scored.sort(key=lambda item: (-item[2], item[0]))

        return [
            RetrievedDocument(document=document, score=score, rank=rank)
            for rank, (_, document, score) in enumerate(
                scored[:top_k], start=1
            )
        ]


__all__ = ["EmbeddingModel", "SentenceTransformerVectorStore"]
