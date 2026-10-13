from __future__ import annotations

import threading
from typing import Any

from .models import (
    DEFAULT_BATCH_SIZE,
    DEFAULT_DIMENSION,
    DEFAULT_DOCUMENT_PREFIX,
    DEFAULT_MAX_SEQUENCE_LENGTH,
    DEFAULT_MODEL_NAME,
    DEFAULT_QUERY_PREFIX,
    MAX_BATCH_SIZE,
    NomicConfig,
    NomicModelInfo,
)
from .utils import (
    normalize_vector,
    to_python_rows,
    validate_dimension,
    validate_task,
    validate_texts,
    validate_vectors,
)


class NomicEmbeddingProvider:
    """Lazy-loaded local Nomic text embedding provider."""

    def __init__(
        self,
        config: NomicConfig | None = None,
        *,
        model: Any = None,
    ) -> None:
        if config is not None and not isinstance(config, NomicConfig):
            raise TypeError("config must be a NomicConfig or None")

        self.config = config if config is not None else NomicConfig()
        self._validate_config()

        self._model = model
        self._lock = threading.RLock()
        self._closed = False
        self._dimension = self.config.dimension or DEFAULT_DIMENSION
        self._info = NomicModelInfo(
            name=self.config.model_name,
            dimension=self._dimension,
            max_sequence_length=self.config.max_sequence_length,
        )

        if model is not None:
            self._read_model_dimension(model)

    def _validate_config(self) -> None:
        config = self.config

        if not isinstance(config.model_name, str) or not config.model_name.strip():
            raise ValueError("model_name must be a non-empty string")

        if (
            isinstance(config.batch_size, bool)
            or not isinstance(config.batch_size, int)
            or not 1 <= config.batch_size <= MAX_BATCH_SIZE
        ):
            raise ValueError(f"batch_size must be between 1 and {MAX_BATCH_SIZE}")

        if (
            isinstance(config.max_sequence_length, bool)
            or not isinstance(config.max_sequence_length, int)
            or config.max_sequence_length < 1
        ):
            raise ValueError("max_sequence_length must be a positive integer")

        validate_dimension(config.dimension)

        if config.device is not None and (
            not isinstance(config.device, str) or not config.device.strip()
        ):
            raise ValueError("device must be a non-empty string or None")

        for name, prefix in (
            ("document_prefix", config.document_prefix),
            ("query_prefix", config.query_prefix),
        ):
            if not isinstance(prefix, str):
                raise TypeError(f"{name} must be a string")

    def _ensure_open(self) -> None:
        if self._closed:
            raise RuntimeError("Nomic embedding provider is closed")

    def _read_model_dimension(self, model: Any) -> None:
        getter = getattr(model, "get_sentence_embedding_dimension", None)
        if not callable(getter):
            return

        dimension = getter()
        if dimension is None:
            return
        if isinstance(dimension, bool) or not isinstance(dimension, int) or dimension < 1:
            raise ValueError("model reported an invalid embedding dimension")

        if self.config.dimension is not None and dimension != self.config.dimension:
            raise ValueError(
                f"Model dimension {dimension} does not match configured "
                f"dimension {self.config.dimension}"
            )

        self._dimension = dimension
        self._info = NomicModelInfo(
            name=self.config.model_name,
            dimension=dimension,
            max_sequence_length=self.config.max_sequence_length,
        )

    def _load_model(self) -> Any:
        self._ensure_open()

        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
            except ImportError as exc:
                raise RuntimeError(
                    "sentence-transformers is required for Nomic embeddings"
                ) from exc

            kwargs: dict[str, Any] = {
                "trust_remote_code": self.config.trust_remote_code,
            }
            if self.config.device is not None:
                kwargs["device"] = self.config.device

            try:
                model = SentenceTransformer(self.config.model_name, **kwargs)
                if hasattr(model, "max_seq_length"):
                    model.max_seq_length = self.config.max_sequence_length
                self._read_model_dimension(model)
                self._model = model
            except Exception as exc:
                raise RuntimeError(
                    f"Failed to load Nomic model {self.config.model_name!r}"
                ) from exc

        return self._model

    @property
    def model_info(self) -> NomicModelInfo:
        return self._info

    @property
    def dimension(self) -> int:
        return self._dimension

    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    def embed(
        self,
        texts: list[str] | tuple[str, ...],
        *,
        task: str = "search_document",
        normalize: bool | None = None,
    ) -> list[list[float]]:
        values = validate_texts(texts)
        validate_task(task)

        if not values:
            return []

        should_normalize = (
            self.config.normalize_embeddings if normalize is None else normalize
        )
        if not isinstance(should_normalize, bool):
            raise TypeError("normalize must be a boolean or None")

        if task == "search_document":
            prefix = self.config.document_prefix
        elif task == "search_query":
            prefix = self.config.query_prefix
        else:
            prefix = f"{task}: "

        prepared = [f"{prefix}{text}" for text in values]

        with self._lock:
            model = self._load_model()
            vectors: list[list[float]] = []

            for start in range(0, len(prepared), self.config.batch_size):
                batch = prepared[start : start + self.config.batch_size]

                try:
                    output = model.encode(
                        batch,
                        batch_size=self.config.batch_size,
                        show_progress_bar=False,
                        convert_to_numpy=True,
                        normalize_embeddings=False,
                    )
                except Exception as exc:
                    raise RuntimeError("Nomic embedding inference failed") from exc

                rows = to_python_rows(output)
                vectors.extend(rows)

            vectors = validate_vectors(
                vectors,
                expected_count=len(values),
                expected_dimension=self._dimension,
            )

            if should_normalize:
                vectors = [normalize_vector(vector) for vector in vectors]

            return vectors

    def embed_documents(
        self,
        texts: list[str] | tuple[str, ...],
        *,
        normalize: bool | None = None,
    ) -> list[list[float]]:
        return self.embed(texts, task="search_document", normalize=normalize)

    def embed_query(
        self,
        text: str,
        *,
        normalize: bool | None = None,
    ) -> list[float]:
        result = self.embed([text], task="search_query", normalize=normalize)
        return result[0]

    def embed_queries(
        self,
        texts: list[str] | tuple[str, ...],
        *,
        normalize: bool | None = None,
    ) -> list[list[float]]:
        return self.embed(texts, task="search_query", normalize=normalize)

    def close(self) -> None:
        with self._lock:
            if self._closed:
                return

            model = self._model
            self._model = None
            self._closed = True

            if model is not None:
                close = getattr(model, "close", None)
                if callable(close):
                    close()

    def __enter__(self) -> "NomicEmbeddingProvider":
        self._ensure_open()
        return self

    def __exit__(self, exc_type: Any, exc: Any, traceback: Any) -> None:
        self.close()
