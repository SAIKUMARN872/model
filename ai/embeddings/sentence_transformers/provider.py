from __future__ import annotations

import threading
from typing import Any

from .models import (
    DEFAULT_BATCH_SIZE,
    DEFAULT_MAX_SEQUENCE_LENGTH,
    DEFAULT_MODEL_NAME,
    SentenceTransformerConfig,
    SentenceTransformerModelInfo,
)
from .utils import (
    l2_normalize,
    to_python_vectors,
    validate_batch_size,
    validate_dimension,
    validate_texts,
    validate_vectors,
)


class SentenceTransformerProvider:
    """Lazy-loaded provider backed by sentence-transformers."""

    def __init__(
        self,
        config: SentenceTransformerConfig | None = None,
        *,
        model: Any = None,
    ) -> None:
        if config is not None and not isinstance(config, SentenceTransformerConfig):
            raise TypeError("config must be a SentenceTransformerConfig or None")

        self.config = config if config is not None else SentenceTransformerConfig()
        self._validate_config()
        self._model = model
        self._lock = threading.RLock()
        self._closed = False
        self._dimension = self.config.dimension or 0

        if model is not None:
            self._read_dimension(model)

    def _validate_config(self) -> None:
        config = self.config
        if not isinstance(config.model_name, str) or not config.model_name.strip():
            raise ValueError("model_name must be a non-empty string")
        validate_batch_size(config.batch_size)
        validate_dimension(config.dimension)

        if (
            isinstance(config.max_sequence_length, bool)
            or not isinstance(config.max_sequence_length, int)
            or config.max_sequence_length < 1
        ):
            raise ValueError("max_sequence_length must be a positive integer")
        if config.device is not None and (
            not isinstance(config.device, str) or not config.device.strip()
        ):
            raise ValueError("device must be a non-empty string or None")
        if not isinstance(config.normalize_embeddings, bool):
            raise TypeError("normalize_embeddings must be a boolean")
        if not isinstance(config.trust_remote_code, bool):
            raise TypeError("trust_remote_code must be a boolean")
        if not isinstance(config.show_progress_bar, bool):
            raise TypeError("show_progress_bar must be a boolean")

    def _ensure_open(self) -> None:
        if self._closed:
            raise RuntimeError("Sentence Transformer provider is closed")

    def _read_dimension(self, model: Any) -> None:
        getter = getattr(model, "get_embedding_dimension", None)
        if not callable(getter):
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

    def _load_model(self) -> Any:
        self._ensure_open()
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
            except ImportError as exc:
                raise RuntimeError(
                    "Install sentence-transformers to use this provider"
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
                self._read_dimension(model)
                self._model = model
            except Exception as exc:
                raise RuntimeError(
                    f"Failed to load Sentence Transformer model "
                    f"{self.config.model_name!r}"
                ) from exc

        return self._model

    @property
    def model_info(self) -> SentenceTransformerModelInfo:
        return SentenceTransformerModelInfo(
            name=self.config.model_name,
            dimension=self._dimension,
            max_sequence_length=self.config.max_sequence_length,
        )

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
        normalize: bool | None = None,
    ) -> list[list[float]]:
        values = validate_texts(texts)
        if not values:
            return []

        should_normalize = (
            self.config.normalize_embeddings if normalize is None else normalize
        )
        if not isinstance(should_normalize, bool):
            raise TypeError("normalize must be a boolean or None")

        with self._lock:
            model = self._load_model()
            vectors: list[list[float]] = []

            for start in range(0, len(values), self.config.batch_size):
                batch = values[start : start + self.config.batch_size]
                try:
                    output = model.encode(
                        batch,
                        batch_size=self.config.batch_size,
                        show_progress_bar=self.config.show_progress_bar,
                        convert_to_numpy=True,
                        normalize_embeddings=False,
                    )
                except Exception as exc:
                    raise RuntimeError("Sentence Transformer inference failed") from exc

                vectors.extend(to_python_vectors(output))

            expected_dimension = self.config.dimension or self._dimension or None
            vectors = validate_vectors(
                vectors,
                expected_count=len(values),
                expected_dimension=expected_dimension,
            )

            if self._dimension == 0 and vectors:
                self._dimension = len(vectors[0])

            if should_normalize:
                vectors = [l2_normalize(vector) for vector in vectors]
            return vectors

    def embed_query(
        self,
        text: str,
        *,
        normalize: bool | None = None,
    ) -> list[float]:
        return self.embed([text], normalize=normalize)[0]

    def close(self) -> None:
        with self._lock:
            if self._closed:
                return
            model = self._model
            self._model = None
            self._closed = True
            close = getattr(model, "close", None) if model is not None else None
            if callable(close):
                close()

    def __enter__(self) -> "SentenceTransformerProvider":
        self._ensure_open()
        return self

    def __exit__(self, exc_type: Any, exc: Any, traceback: Any) -> None:
        self.close()

