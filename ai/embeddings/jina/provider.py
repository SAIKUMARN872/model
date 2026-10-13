"""Lazy-loaded Jina SentenceTransformer embedding provider."""

from __future__ import annotations

import threading
from collections.abc import Sequence
from typing import Any

from .models import (
    DEFAULT_BATCH_SIZE,
    DEFAULT_DIMENSION,
    DEFAULT_MODEL_NAME,
    JinaModelInfo,
    JinaProviderConfig,
)
from .utils import (
    prepare_documents,
    prepare_queries,
    validate_batch_size,
    validate_vector,
)


class JinaEmbeddingProvider:
    """Generate embeddings with a Jina model via Sentence Transformers.

    Model downloads and heavyweight imports happen only when the first
    embedding request is made. Tests can inject a compatible model object.
    """

    def __init__(
        self,
        model_name: str = DEFAULT_MODEL_NAME,
        *,
        config: JinaProviderConfig | None = None,
        model: Any | None = None,
    ) -> None:
        if config is not None and not isinstance(config, JinaProviderConfig):
            raise TypeError("config must be a JinaProviderConfig")
        if not isinstance(model_name, str) or not model_name.strip():
            raise ValueError("model_name must be a non-empty string")

        self.config = config or JinaProviderConfig(model_name=model_name.strip())
        self.model_name = self.config.model_name
        if not isinstance(self.model_name, str) or not self.model_name.strip():
            raise ValueError("config.model_name must be a non-empty string")
        validate_batch_size(self.config.batch_size, self.config.max_batch_size)

        if (
            isinstance(self.config.max_sequence_length, bool)
            or not isinstance(self.config.max_sequence_length, int)
            or self.config.max_sequence_length < 1
        ):
            raise ValueError("max_sequence_length must be a positive integer")

        self._model = model
        self._closed = False
        self._lock = threading.RLock()
        self._dimension = DEFAULT_DIMENSION
        self._info = JinaModelInfo(
            model_name=self.model_name,
            max_sequence_length=self.config.max_sequence_length,
        )

        if model is not None:
            self._apply_model_sequence_limit()
            if hasattr(model, "get_sentence_embedding_dimension"):
                reported_dimension = model.get_sentence_embedding_dimension()
                if reported_dimension is not None:
                    if (
                        isinstance(reported_dimension, bool)
                        or not isinstance(reported_dimension, int)
                        or reported_dimension < 1
                    ):
                        raise ValueError("Model reported an invalid embedding dimension")
                    self._dimension = reported_dimension
                    self._info = JinaModelInfo(
                        model_name=self.model_name,
                        dimension=self._dimension,
                        max_sequence_length=self.config.max_sequence_length,
                    )

    @property
    def info(self) -> JinaModelInfo:
        return self._info

    @property
    def dimension(self) -> int:
        with self._lock:
            self._ensure_model()
            return self._dimension

    def _apply_model_sequence_limit(self) -> None:
        if self._model is not None and hasattr(self._model, "max_seq_length"):
            self._model.max_seq_length = self.config.max_sequence_length

    def _ensure_model(self) -> Any:
        if self._closed:
            raise RuntimeError("JinaEmbeddingProvider is closed")
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
            except ImportError as exc:
                raise RuntimeError(
                    "Jina embeddings require sentence-transformers. "
                    "Install it with: pip install sentence-transformers"
                ) from exc

            kwargs: dict[str, Any] = {
                "trust_remote_code": self.config.trust_remote_code,
            }
            if self.config.device is not None:
                kwargs["device"] = self.config.device

            try:
                self._model = SentenceTransformer(self.model_name, **kwargs)
                self._apply_model_sequence_limit()
                reported_dimension = self._model.get_sentence_embedding_dimension()
                if reported_dimension is not None:
                    self._dimension = int(reported_dimension)
                    if self._dimension < 1:
                        raise ValueError("Model reported an invalid embedding dimension")
                self._info = JinaModelInfo(
                    model_name=self.model_name,
                    dimension=self._dimension,
                    max_sequence_length=self.config.max_sequence_length,
                )
            except Exception as exc:
                self._model = None
                raise RuntimeError(
                    f"Failed to load Jina embedding model '{self.model_name}': {exc}"
                ) from exc
        return self._model

    def embed_texts(
        self,
        texts: Sequence[str],
        *,
        batch_size: int | None = None,
        normalize_embeddings: bool | None = None,
    ) -> list[list[float]]:
        documents = prepare_documents(texts)
        if not documents:
            return []

        chosen_batch_size = (
            self.config.batch_size if batch_size is None else batch_size
        )
        validate_batch_size(chosen_batch_size, self.config.max_batch_size)
        normalize = (
            self.config.normalize_embeddings
            if normalize_embeddings is None
            else normalize_embeddings
        )
        if not isinstance(normalize, bool):
            raise TypeError("normalize_embeddings must be a boolean")

        with self._lock:
            model = self._ensure_model()
            try:
                vectors = model.encode(
                    documents,
                    batch_size=chosen_batch_size,
                    normalize_embeddings=normalize,
                    convert_to_numpy=True,
                    show_progress_bar=False,
                )
            except Exception as exc:
                raise RuntimeError(f"Jina document embedding failed: {exc}") from exc

            try:
                rows = vectors.tolist() if hasattr(vectors, "tolist") else list(vectors)
                if len(rows) != len(documents):
                    raise ValueError(
                        f"Model returned {len(rows)} vectors for {len(documents)} texts"
                    )
                validated = [
                    validate_vector(row, self._dimension) for row in rows
                ]
            except (TypeError, ValueError) as exc:
                raise ValueError(f"Invalid Jina embedding output: {exc}") from exc
            return validated

    def embed_query(self, query: str) -> list[float]:
        return self.embed_queries([query])[0]

    def embed_queries(
        self,
        queries: Sequence[str],
        *,
        batch_size: int | None = None,
        normalize_embeddings: bool | None = None,
    ) -> list[list[float]]:
        validated_queries = prepare_queries(queries)
        if not validated_queries:
            return []
        return self.embed_texts(
            validated_queries,
            batch_size=batch_size,
            normalize_embeddings=normalize_embeddings,
        )

    def embed(self, texts: Sequence[str]) -> list[list[float]]:
        """Compatibility alias for embedding a batch of texts."""
        return self.embed_texts(texts)

    def close(self) -> None:
        with self._lock:
            self._model = None
            self._closed = True

    def __enter__(self) -> "JinaEmbeddingProvider":
        if self._closed:
            raise RuntimeError("JinaEmbeddingProvider is closed")
        return self

    def __exit__(self, exc_type: Any, exc_value: Any, traceback: Any) -> None:
        self.close()

