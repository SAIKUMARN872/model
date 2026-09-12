"""
Sentence Transformers embedding provider for ModelNow.

This module provides the high-level provider interface used by:

    - EmbeddingManager
    - IndexBuilder
    - Retrieval / indexing pipelines

The implementation delegates model loading and encoding to
SentenceTransformerClient.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .client import (
    SentenceTransformerClient,
)
from .models import (
    SentenceEmbedding,
    SentenceTransformerConfig,
)
from .utils import (
    estimate_tokens,
    estimate_tokens_batch,
    get_dimensions,
    validate_text,
    validate_texts,
)


@dataclass
class SentenceTransformerProvider:
    """
    High-level Sentence Transformers embedding provider.

    Compatible with the common ModelNow embedding interface:

        provider.embed(text)
        provider.embed_many(texts)
        provider.embed_query(query)
        provider.embed_queries(queries)
        provider.embed_document(document)
        provider.embed_documents(documents)

    It can therefore be used directly with IndexBuilder
    and EmbeddingManager.
    """

    config: SentenceTransformerConfig | None = None

    def __post_init__(self) -> None:
        """
        Initialize the provider and its underlying client.
        """

        if self.config is None:
            self.config = (
                SentenceTransformerConfig()
            )

        self.client = (
            SentenceTransformerClient(
                self.config
            )
        )

    # ==========================================================
    # Callable interface
    # ==========================================================

    def __call__(
        self,
        texts: list[str],
    ) -> list[list[float]]:
        """
        Allow the provider to be called directly.

        Example:

            vectors = provider(
                ["hello", "world"]
            )
        """

        return self.embed_many(
            texts
        )

    # ==========================================================
    # Single embedding
    # ==========================================================

    def embed(
        self,
        text: str,
    ) -> list[float]:
        """
        Generate an embedding for one piece of text.
        """

        text = validate_text(
            text
        )

        return self.client.encode_one(
            text
        )

    # ==========================================================
    # Batch embedding
    # ==========================================================

    def embed_many(
        self,
        texts: list[str],
    ) -> list[list[float]]:
        """
        Generate embeddings for multiple texts.
        """

        texts = validate_texts(
            texts
        )

        return self.client.encode(
            texts
        )

    # ==========================================================
    # Query embeddings
    # ==========================================================

    def embed_query(
        self,
        query: str,
    ) -> list[float]:
        """
        Generate an embedding for a search query.

        Kept separate from embed_document() so that
        future models supporting query/document-specific
        processing can be introduced without changing
        the application interface.
        """

        query = validate_text(
            query
        )

        return self.client.encode_one(
            query
        )

    def embed_queries(
        self,
        queries: list[str],
    ) -> list[list[float]]:
        """
        Generate embeddings for multiple queries.
        """

        queries = validate_texts(
            queries
        )

        return self.client.encode(
            queries
        )

    # ==========================================================
    # Document embeddings
    # ==========================================================

    def embed_document(
        self,
        document: str,
    ) -> list[float]:
        """
        Generate an embedding for one document.
        """

        document = validate_text(
            document
        )

        return self.client.encode_one(
            document
        )

    def embed_documents(
        self,
        documents: list[str],
    ) -> list[list[float]]:
        """
        Generate embeddings for multiple documents.
        """

        documents = validate_texts(
            documents
        )

        return self.client.encode(
            documents
        )

    # ==========================================================
    # Rich embedding objects
    # ==========================================================

    def embed_objects(
        self,
        texts: list[str],
    ) -> list[SentenceEmbedding]:
        """
        Generate rich SentenceEmbedding objects.
        """

        texts = validate_texts(
            texts
        )

        vectors = self.embed_many(
            texts
        )

        dimensions = get_dimensions(
            vectors
        )

        return [
            SentenceEmbedding(
                text=text,
                vector=vector,
                model_name=(
                    self.config.model_name
                ),
                dimensions=dimensions,
                normalized=(
                    self.config.normalize_embeddings
                ),
            )
            for text, vector
            in zip(
                texts,
                vectors,
            )
        ]

    # ==========================================================
    # Usage / statistics
    # ==========================================================

    def estimate_usage(
        self,
        texts: list[str],
    ) -> dict[str, Any]:
        """
        Estimate token usage without performing inference.
        """

        texts = validate_texts(
            texts
        )

        return {
            "input_count": len(
                texts
            ),
            "estimated_tokens": (
                estimate_tokens_batch(
                    texts
                )
            ),
            "model_name": (
                self.config.model_name
            ),
            "batch_size": (
                self.config.batch_size
            ),
        }

    def estimate_text_tokens(
        self,
        text: str,
    ) -> int:
        """
        Estimate tokens for one text.
        """

        return estimate_tokens(
            validate_text(text)
        )

    # ==========================================================
    # Model information
    # ==========================================================

    def dimension(self) -> int:
        """
        Return the embedding dimension.

        The model is loaded lazily if necessary.
        """

        return self.client.dimension()

    def info(self) -> dict[str, Any]:
        """
        Return provider and model information.
        """

        return self.client.info()

    # ==========================================================
    # Model lifecycle
    # ==========================================================

    def load(self) -> None:
        """
        Explicitly load the model.
        """

        self.client.load()

    def unload(self) -> None:
        """
        Release the loaded model.
        """

        self.client.unload()

    @property
    def loaded(self) -> bool:
        """
        Return whether the model is currently loaded.
        """

        return self.client.loaded

    # ==========================================================
    # Configuration helpers
    # ==========================================================

    @property
    def model_name(self) -> str:
        """
        Return the configured model name.
        """

        return self.config.model_name

    @property
    def device(self) -> str:
        """
        Return the configured device.
        """

        return self.config.device

    @property
    def batch_size(self) -> int:
        """
        Return the configured batch size.
        """

        return self.config.batch_size

    @property
    def normalize_embeddings(self) -> bool:
        """
        Return whether embeddings are normalized.
        """

        return (
            self.config.normalize_embeddings
        )

    # ==========================================================
    # Health check
    # ==========================================================

    def health_check(self) -> dict[str, Any]:
        """
        Check whether the provider can load and generate
        an embedding successfully.
        """

        try:

            vector = self.embed(
                "ModelNow health check"
            )

            return {
                "healthy": True,
                "provider": (
                    "sentence_transformers"
                ),
                "model_name": (
                    self.config.model_name
                ),
                "dimensions": len(
                    vector
                ),
                "device": (
                    self.config.device
                ),
            }

        except Exception as exc:

            return {
                "healthy": False,
                "provider": (
                    "sentence_transformers"
                ),
                "model_name": (
                    self.config.model_name
                ),
                "error": str(exc),
            }

    # ==========================================================
    # Representation
    # ==========================================================

    def __repr__(self) -> str:
        return (
            "SentenceTransformerProvider("
            f"model_name="
            f"'{self.config.model_name}', "
            f"device="
            f"'{self.config.device}', "
            f"batch_size="
            f"{self.config.batch_size}"
            ")"
        )