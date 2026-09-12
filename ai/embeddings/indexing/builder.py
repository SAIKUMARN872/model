"""
Index builder for ModelNow.

Responsible for:
- document preparation
- chunking
- embedding generation
- index item creation
"""

from __future__ import annotations

import inspect
from dataclasses import dataclass, field
from typing import Any, Callable

from .utils import (
    batch_items,
    chunk_text,
    content_hash,
    estimate_tokens,
    generate_id,
    merge_metadata,
    normalize_text,
    utc_now,
)


@dataclass
class Document:
    """Input document."""

    document_id: str

    text: str

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


@dataclass
class IndexChunk:
    """One searchable chunk."""

    chunk_id: str

    document_id: str

    text: str

    embedding: list[float]

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    chunk_index: int = 0

    token_count: int = 0

    content_hash: str = ""

    created_at: Any = field(
        default_factory=utc_now
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "chunk_id": self.chunk_id,
            "document_id": self.document_id,
            "text": self.text,
            "embedding": self.embedding,
            "metadata": dict(
                self.metadata
            ),
            "chunk_index": self.chunk_index,
            "token_count": self.token_count,
            "content_hash": self.content_hash,
            "created_at": (
                self.created_at.isoformat()
            ),
        }


@dataclass
class BuilderConfig:
    """Configuration for index building."""

    chunk_size: int = 500

    chunk_overlap: int = 50

    embedding_batch_size: int = 32

    normalize_text: bool = True

    include_content_hash: bool = True

    def __post_init__(self) -> None:

        if self.chunk_size <= 0:

            raise ValueError(
                "chunk_size must be positive"
            )

        if (
            self.chunk_overlap
            < 0
        ):

            raise ValueError(
                "chunk_overlap cannot be negative"
            )

        if (
            self.chunk_overlap
            >= self.chunk_size
        ):

            raise ValueError(
                "chunk_overlap must be "
                "smaller than chunk_size"
            )

        if (
            self.embedding_batch_size
            <= 0
        ):

            raise ValueError(
                "embedding_batch_size must be positive"
            )


class IndexBuilder:
    """
    Builds vector-index records from documents.

    The embedder must implement:

        embed_documents(texts)

    or be callable with a list of texts.
    """

    def __init__(
        self,
        embedder: Any,
        config: BuilderConfig | None = None,
    ) -> None:

        if embedder is None:

            raise ValueError(
                "embedder cannot be None"
            )

        self.embedder = embedder

        self.config = (
            config
            or BuilderConfig()
        )

    # --------------------------------------------------
    # Document preparation
    # --------------------------------------------------

    def prepare_document(
        self,
        document: Document,
    ) -> list[dict[str, Any]]:

        if not document.document_id:

            raise ValueError(
                "document_id cannot be empty"
            )

        text = document.text

        if self.config.normalize_text:

            text = normalize_text(
                text
            )

        if not text:

            raise ValueError(
                f"Document '{document.document_id}' "
                "contains no text"
            )

        chunks = chunk_text(
            text,
            chunk_size=(
                self.config.chunk_size
            ),
            overlap=(
                self.config.chunk_overlap
            ),
        )

        result = []

        for index, chunk in enumerate(
            chunks
        ):

            metadata = merge_metadata(
                document.metadata,
                {
                    "document_id": (
                        document.document_id
                    ),
                    "chunk_index": index,
                },
            )

            if self.config.include_content_hash:

                metadata[
                    "content_hash"
                ] = content_hash(
                    chunk
                )

            result.append(
                {
                    "chunk_id": generate_id(
                        "chunk"
                    ),
                    "document_id": (
                        document.document_id
                    ),
                    "text": chunk,
                    "metadata": metadata,
                    "chunk_index": index,
                }
            )

        return result

    def prepare_documents(
        self,
        documents: list[Document],
    ) -> list[dict[str, Any]]:

        result = []

        for document in documents:

            result.extend(
                self.prepare_document(
                    document
                )
            )

        return result

    # --------------------------------------------------
    # Embeddings
    # --------------------------------------------------

    def _embed(
        self,
        texts: list[str],
    ) -> list[list[float]]:

        if hasattr(
            self.embedder,
            "embed_documents",
        ):

            result = (
                self.embedder.embed_documents(
                    texts
                )
            )

        elif hasattr(
            self.embedder,
            "embed_many",
        ):

            result = (
                self.embedder.embed_many(
                    texts
                )
            )

        elif callable(
            self.embedder
        ):

            result = self.embedder(
                texts
            )

        else:

            raise TypeError(
                "Embedder must provide "
                "'embed_documents()', "
                "'embed_many()', or be callable"
            )

        if inspect.isawaitable(
            result
        ):

            raise TypeError(
                "Async embedders must be handled "
                "through build_async()"
            )

        result = [
            list(
                map(
                    float,
                    vector,
                )
            )
            for vector in result
        ]

        if len(result) != len(texts):

            raise ValueError(
                "Embedding count does not match "
                "the number of chunks"
            )

        return result

    async def _embed_async(
        self,
        texts: list[str],
    ) -> list[list[float]]:

        if hasattr(
            self.embedder,
            "embed_documents",
        ):

            result = (
                self.embedder.embed_documents(
                    texts
                )
            )

        elif hasattr(
            self.embedder,
            "embed_many",
        ):

            result = (
                self.embedder.embed_many(
                    texts
                )
            )

        elif callable(
            self.embedder
        ):

            result = self.embedder(
                texts
            )

        else:

            raise TypeError(
                "Invalid embedder"
            )

        if inspect.isawaitable(
            result
        ):

            result = await result

        result = [
            list(
                map(
                    float,
                    vector,
                )
            )
            for vector in result
        ]

        if len(result) != len(texts):

            raise ValueError(
                "Embedding count does not match "
                "the number of chunks"
            )

        return result

    # --------------------------------------------------
    # Build
    # --------------------------------------------------

    def build(
        self,
        documents: list[Document],
    ) -> list[IndexChunk]:

        prepared = (
            self.prepare_documents(
                documents
            )
        )

        if not prepared:

            return []

        chunks: list[
            IndexChunk
        ] = []

        for batch in batch_items(
            prepared,
            self.config.embedding_batch_size,
        ):

            texts = [
                item["text"]
                for item in batch
            ]

            embeddings = self._embed(
                texts
            )

            for item, embedding in zip(
                batch,
                embeddings,
            ):

                chunks.append(
                    IndexChunk(
                        chunk_id=(
                            item["chunk_id"]
                        ),
                        document_id=(
                            item["document_id"]
                        ),
                        text=item["text"],
                        embedding=embedding,
                        metadata=dict(
                            item["metadata"]
                        ),
                        chunk_index=(
                            item["chunk_index"]
                        ),
                        token_count=(
                            estimate_tokens(
                                item["text"]
                            )
                        ),
                    )
                )

        return chunks

    async def build_async(
        self,
        documents: list[Document],
    ) -> list[IndexChunk]:

        prepared = (
            self.prepare_documents(
                documents
            )
        )

        if not prepared:

            return []

        chunks: list[
            IndexChunk
        ] = []

        for batch in batch_items(
            prepared,
            self.config.embedding_batch_size,
        ):

            texts = [
                item["text"]
                for item in batch
            ]

            embeddings = (
                await self._embed_async(
                    texts
                )
            )

            for item, embedding in zip(
                batch,
                embeddings,
            ):

                chunks.append(
                    IndexChunk(
                        chunk_id=(
                            item["chunk_id"]
                        ),
                        document_id=(
                            item["document_id"]
                        ),
                        text=item["text"],
                        embedding=embedding,
                        metadata=dict(
                            item["metadata"]
                        ),
                        chunk_index=(
                            item["chunk_index"]
                        ),
                        token_count=(
                            estimate_tokens(
                                item["text"]
                            )
                        ),
                    )
                )

        return chunks