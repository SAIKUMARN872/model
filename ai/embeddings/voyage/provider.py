from __future__ import annotations

import threading
from typing import Any

from .models import VoyageEmbeddingConfig
from .utils import (
    normalize_vector,
    validate_batch_size,
    validate_texts,
    validate_vector,
)


class VoyageEmbeddingProvider:
    """Voyage AI embeddings provider with lazy SDK initialization."""

    def __init__(
        self,
        config: VoyageEmbeddingConfig | None = None,
        *,
        client: Any = None,
    ) -> None:
        if config is not None and not isinstance(config, VoyageEmbeddingConfig):
            raise TypeError("config must be a VoyageEmbeddingConfig or None")
        self.config = config if config is not None else VoyageEmbeddingConfig()
        self._validate_config()
        self._client = client
        self._owns_client = client is None
        self._closed = False
        self._lock = threading.RLock()
        self._dimension = self.config.output_dimension

    def _validate_config(self) -> None:
        config = self.config
        if not isinstance(config.model_name, str) or not config.model_name.strip():
            raise ValueError("model_name must be a non-empty string")
        validate_batch_size(config.batch_size)
        if config.output_dimension is not None and (
            isinstance(config.output_dimension, bool)
            or not isinstance(config.output_dimension, int)
            or config.output_dimension < 1
        ):
            raise ValueError("output_dimension must be a positive integer or None")
        if not isinstance(config.normalize_embeddings, bool):
            raise TypeError("normalize_embeddings must be a boolean")
        if (
            isinstance(config.timeout, bool)
            or not isinstance(config.timeout, (int, float))
            or config.timeout <= 0
        ):
            raise ValueError("timeout must be a positive number")
        if (
            isinstance(config.max_retries, bool)
            or not isinstance(config.max_retries, int)
            or config.max_retries < 0
        ):
            raise ValueError("max_retries must be a non-negative integer")

    def _ensure_open(self) -> None:
        if self._closed:
            raise RuntimeError("Voyage embedding provider is closed")

    def _get_client(self) -> Any:
        self._ensure_open()
        if self._client is None:
            try:
                import voyageai
            except ImportError as exc:
                raise RuntimeError(
                    "Install voyageai to use this provider"
                ) from exc

            kwargs: dict[str, Any] = {
                "timeout": self.config.timeout,
                "max_retries": self.config.max_retries,
            }
            if self.config.api_key:
                kwargs["api_key"] = self.config.api_key
            self._client = voyageai.Client(**kwargs)
        return self._client

    def embed(
        self,
        texts: list[str] | tuple[str, ...],
        *,
        input_type: str = "document",
    ) -> list[list[float]]:
        if input_type not in ("query", "document"):
            raise ValueError("input_type must be 'query' or 'document'")
        values = validate_texts(texts)
        if not values:
            return []

        with self._lock:
            self._ensure_open()
            client = self._get_client()
            output: list[list[float]] = []

            for start in range(0, len(values), self.config.batch_size):
                batch = values[start:start + self.config.batch_size]
                kwargs: dict[str, Any] = {
                    "texts": batch,
                    "model": self.config.model_name,
                    "input_type": input_type,
                }
                if self.config.output_dimension is not None:
                    kwargs["output_dimension"] = self.config.output_dimension

                response = client.embed(**kwargs)
                vectors = response.embeddings
                if len(vectors) != len(batch):
                    raise ValueError("Embedding response count does not match input count")

                for raw_vector in vectors:
                    vector = validate_vector(raw_vector, self._dimension)
                    if self._dimension is None:
                        self._dimension = len(vector)
                    if self.config.normalize_embeddings:
                        vector = normalize_vector(vector)
                    output.append(vector)

            return output

    def embed_query(self, text: str) -> list[float]:
        return self.embed([text], input_type="query")[0]

    def embed_documents(self, texts: list[str] | tuple[str, ...]) -> list[list[float]]:
        return self.embed(texts, input_type="document")

    @property
    def dimension(self) -> int | None:
        return self._dimension

    def close(self) -> None:
        with self._lock:
            if self._closed:
                return
            if self._owns_client and self._client is not None:
                close = getattr(self._client, "close", None)
                if callable(close):
                    close()
            self._closed = True

    def __enter__(self) -> "VoyageEmbeddingProvider":
        self._ensure_open()
        return self

    def __exit__(self, exc_type: Any, exc: Any, traceback: Any) -> None:
        self.close()
