"""
Index manager for ModelNow.

Provides:
- index creation
- insertion
- updating
- deletion
- vector similarity search
- document management
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from threading import RLock
from typing import Any, Iterable

from .builder import (
    Document,
    IndexBuilder,
    IndexChunk,
)
from .utils import (
    cosine_similarity,
    generate_id,
    utc_now,
)


class IndexErrorBase(
    Exception
):
    """Base indexing exception."""


class IndexNotFoundError(
    IndexErrorBase
):
    """Raised when an index does not exist."""


class IndexDimensionError(
    IndexErrorBase
):
    """Raised when vector dimensions do not match."""


@dataclass
class SearchResult:
    """One vector search result."""

    chunk_id: str

    document_id: str

    text: str

    score: float

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    rank: int = 0

    def to_dict(self) -> dict[str, Any]:

        return {
            "chunk_id": self.chunk_id,
            "document_id": self.document_id,
            "text": self.text,
            "score": self.score,
            "metadata": dict(
                self.metadata
            ),
            "rank": self.rank,
        }


@dataclass
class IndexStats:
    """Index statistics."""

    index_id: str

    name: str

    documents: int

    chunks: int

    dimensions: int

    created_at: Any

    updated_at: Any

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "index_id": self.index_id,
            "name": self.name,
            "documents": self.documents,
            "chunks": self.chunks,
            "dimensions": self.dimensions,
            "created_at": (
                self.created_at.isoformat()
            ),
            "updated_at": (
                self.updated_at.isoformat()
            ),
            "metadata": dict(
                self.metadata
            ),
        }


@dataclass
class _Index:
    """Internal index representation."""

    index_id: str

    name: str

    chunks: dict[str, IndexChunk]

    created_at: Any

    updated_at: Any

    dimensions: int = 0

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


class IndexManager:
    """
    Thread-safe in-process vector index.

    This is intentionally backend-independent.

    It can later be replaced by:
        FAISS
        Qdrant
        Milvus
        Pinecone
        Weaviate
        Elasticsearch
        PostgreSQL/pgvector
    """

    def __init__(
        self,
        builder: IndexBuilder,
    ) -> None:

        self.builder = builder

        self._indexes: dict[
            str,
            _Index,
        ] = {}

        self._lock = RLock()

    # --------------------------------------------------
    # Index lifecycle
    # --------------------------------------------------

    def create_index(
        self,
        name: str,
        dimensions: int = 0,
        metadata: dict[str, Any] | None = None,
    ) -> str:

        if not name.strip():

            raise ValueError(
                "Index name cannot be empty"
            )

        if dimensions < 0:

            raise ValueError(
                "dimensions cannot be negative"
            )

        index_id = generate_id(
            "index"
        )

        now = utc_now()

        with self._lock:

            self._indexes[
                index_id
            ] = _Index(
                index_id=index_id,
                name=name,
                chunks={},
                created_at=now,
                updated_at=now,
                dimensions=dimensions,
                metadata=dict(
                    metadata or {}
                ),
            )

        return index_id

    def delete_index(
        self,
        index_id: str,
    ) -> bool:

        with self._lock:

            if index_id not in self._indexes:

                return False

            del self._indexes[
                index_id
            ]

            return True

    def get_stats(
        self,
        index_id: str,
    ) -> IndexStats:

        index = self._get_index(
            index_id
        )

        with self._lock:

            documents = len(
                {
                    chunk.document_id
                    for chunk
                    in index.chunks.values()
                }
            )

            return IndexStats(
                index_id=index.index_id,
                name=index.name,
                documents=documents,
                chunks=len(
                    index.chunks
                ),
                dimensions=index.dimensions,
                created_at=index.created_at,
                updated_at=index.updated_at,
                metadata=dict(
                    index.metadata
                ),
            )

    def list_indexes(
        self,
    ) -> list[IndexStats]:

        with self._lock:

            return [
                self.get_stats(
                    index_id
                )
                for index_id
                in self._indexes
            ]

    # --------------------------------------------------
    # Insert/update
    # --------------------------------------------------

    def add_documents(
        self,
        index_id: str,
        documents: list[Document],
    ) -> list[IndexChunk]:

        index = self._get_index(
            index_id
        )

        chunks = self.builder.build(
            documents
        )

        self._insert_chunks(
            index,
            chunks,
        )

        return chunks

    async def add_documents_async(
        self,
        index_id: str,
        documents: list[Document],
    ) -> list[IndexChunk]:

        index = self._get_index(
            index_id
        )

        chunks = await self.builder.build_async(
            documents
        )

        self._insert_chunks(
            index,
            chunks,
        )

        return chunks

    def add_chunks(
        self,
        index_id: str,
        chunks: list[IndexChunk],
    ) -> None:

        index = self._get_index(
            index_id
        )

        self._insert_chunks(
            index,
            chunks,
        )

    def _insert_chunks(
        self,
        index: _Index,
        chunks: list[IndexChunk],
    ) -> None:

        with self._lock:

            for chunk in chunks:

                dimension = len(
                    chunk.embedding
                )

                if index.dimensions == 0:

                    index.dimensions = (
                        dimension
                    )

                elif (
                    dimension
                    != index.dimensions
                ):

                    raise IndexDimensionError(
                        "Embedding dimension mismatch: "
                        f"index={index.dimensions}, "
                        f"chunk={dimension}"
                    )

                index.chunks[
                    chunk.chunk_id
                ] = chunk

            index.updated_at = utc_now()

    # --------------------------------------------------
    # Document deletion
    # --------------------------------------------------

    def delete_document(
        self,
        index_id: str,
        document_id: str,
    ) -> int:

        index = self._get_index(
            index_id
        )

        with self._lock:

            chunk_ids = [
                chunk_id
                for chunk_id, chunk
                in index.chunks.items()
                if chunk.document_id
                == document_id
            ]

            for chunk_id in chunk_ids:

                del index.chunks[
                    chunk_id
                ]

            if chunk_ids:

                index.updated_at = (
                    utc_now()
                )

            return len(chunk_ids)

    def clear(
        self,
        index_id: str,
    ) -> None:

        index = self._get_index(
            index_id
        )

        with self._lock:

            index.chunks.clear()

            index.updated_at = utc_now()

    # --------------------------------------------------
    # Search
    # --------------------------------------------------

    def search(
        self,
        index_id: str,
        query_vector: Iterable[float],
        top_k: int = 5,
        min_score: float | None = None,
        metadata_filter: dict[str, Any] | None = None,
    ) -> list[SearchResult]:

        if top_k <= 0:

            raise ValueError(
                "top_k must be positive"
            )

        index = self._get_index(
            index_id
        )

        query = [
            float(value)
            for value in query_vector
        ]

        if (
            index.dimensions
            and len(query)
            != index.dimensions
        ):

            raise IndexDimensionError(
                "Query dimension does not match "
                "index dimension"
            )

        candidates = []

        with self._lock:

            for chunk in (
                index.chunks.values()
            ):

                if metadata_filter:

                    if not self._matches_filter(
                        chunk.metadata,
                        metadata_filter,
                    ):

                        continue

                score = cosine_similarity(
                    query,
                    chunk.embedding,
                )

                if (
                    min_score is not None
                    and score < min_score
                ):

                    continue

                candidates.append(
                    (
                        score,
                        chunk,
                    )
                )

        candidates.sort(
            key=lambda item: item[0],
            reverse=True,
        )

        results = []

        for rank, (
            score,
            chunk,
        ) in enumerate(
            candidates[:top_k],
            start=1,
        ):

            results.append(
                SearchResult(
                    chunk_id=chunk.chunk_id,
                    document_id=chunk.document_id,
                    text=chunk.text,
                    score=score,
                    metadata=dict(
                        chunk.metadata
                    ),
                    rank=rank,
                )
            )

        return results

    def search_text(
        self,
        index_id: str,
        query: str,
        top_k: int = 5,
        min_score: float | None = None,
        metadata_filter: dict[str, Any] | None = None,
    ) -> list[SearchResult]:

        if hasattr(
            self.builder.embedder,
            "embed_query",
        ):

            query_vector = (
                self.builder.embedder.embed_query(
                    query
                )
            )

        elif hasattr(
            self.builder.embedder,
            "embed",
        ):

            query_vector = (
                self.builder.embedder.embed(
                    query
                )
            )

        else:

            raise TypeError(
                "Embedder must support "
                "'embed_query()' or 'embed()'"
            )

        return self.search(
            index_id=index_id,
            query_vector=query_vector,
            top_k=top_k,
            min_score=min_score,
            metadata_filter=metadata_filter,
        )

    # --------------------------------------------------
    # Helpers
    # --------------------------------------------------

    def _get_index(
        self,
        index_id: str,
    ) -> _Index:

        with self._lock:

            index = self._indexes.get(
                index_id
            )

            if index is None:

                raise IndexNotFoundError(
                    f"Index not found: "
                    f"{index_id}"
                )

            return index

    @staticmethod
    def _matches_filter(
        metadata: dict[str, Any],
        filters: dict[str, Any],
    ) -> bool:

        for key, expected in filters.items():

            actual = metadata.get(
                key
            )

            if callable(expected):

                if not expected(actual):
                    return False

            elif isinstance(
                expected,
                (list, tuple, set),
            ):

                if actual not in expected:
                    return False

            elif actual != expected:

                return False

        return True

    def all_chunks(
        self,
        index_id: str,
    ) -> list[IndexChunk]:

        index = self._get_index(
            index_id
        )

        with self._lock:

            return list(
                index.chunks.values()
            )