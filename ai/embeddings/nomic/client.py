"""
Low-level Nomic model client.
"""

from __future__ import annotations

from typing import Any

from .models import NomicConfig
from .utils import (
    normalize_embeddings,
    validate_embeddings,
    validate_texts,
)


class NomicClientError(Exception):
    """Base Nomic client error."""


class NomicLoadError(NomicClientError):
    """Raised when Nomic cannot be loaded."""


class NomicClient:
    """
    Lazy-loading Nomic embedding client.
    """

    def __init__(
        self,
        config: NomicConfig | None = None,
    ) -> None:

        self.config = (
            config
            or NomicConfig()
        )

        self._model: Any = None

    def load(self) -> Any:

        if self._model is not None:
            return self._model

        try:

            from sentence_transformers import (
                SentenceTransformer,
            )

        except ImportError as exc:

            raise NomicLoadError(
                "sentence-transformers is required. "
                "Install it with: "
                "pip install sentence-transformers"
            ) from exc

        try:

            kwargs = dict(
                self.config.model_kwargs
            )

            if self.config.cache_folder:

                kwargs["cache_folder"] = (
                    self.config.cache_folder
                )

            kwargs.setdefault(
                "trust_remote_code",
                self.config.trust_remote_code,
            )

            self._model = SentenceTransformer(
                self.config.model_name,
                device=self.config.device,
                **kwargs,
            )

            if hasattr(
                self._model,
                "max_seq_length",
            ):

                self._model.max_seq_length = (
                    self.config.max_length
                )

            return self._model

        except Exception as exc:

            raise NomicLoadError(
                f"Failed to load Nomic model "
                f"'{self.config.model_name}': {exc}"
            ) from exc

    @property
    def model(self) -> Any:
        return self.load()

    @property
    def loaded(self) -> bool:
        return self._model is not None

    def unload(self) -> None:
        self._model = None

    def encode(
        self,
        texts: list[str],
    ) -> list[list[float]]:

        texts = validate_texts(
            texts
        )

        model = self.load()

        kwargs = dict(
            self.config.encode_kwargs
        )

        kwargs.setdefault(
            "batch_size",
            self.config.batch_size,
        )

        kwargs.setdefault(
            "normalize_embeddings",
            False,
        )

        try:

            embeddings = model.encode(
                texts,
                **kwargs,
            )

        except Exception as exc:

            raise NomicClientError(
                f"Nomic encoding failed: {exc}"
            ) from exc

        if hasattr(
            embeddings,
            "tolist",
        ):

            embeddings = embeddings.tolist()

        embeddings = validate_embeddings(
            embeddings,
            len(texts),
        )

        if self.config.normalize_embeddings:

            embeddings = normalize_embeddings(
                embeddings
            )

        return embeddings

    def encode_one(
        self,
        text: str,
    ) -> list[float]:

        return self.encode(
            [text]
        )[0]

    def dimension(self) -> int:

        return len(
            self.encode_one(
                "dimension test"
            )
        )

    def info(self) -> dict[str, Any]:

        return {
            "provider": "nomic",
            "model_name": (
                self.config.model_name
            ),
            "device": self.config.device,
            "batch_size": (
                self.config.batch_size
            ),
            "max_length": (
                self.config.max_length
            ),
            "normalize_embeddings": (
                self.config.normalize_embeddings
            ),
            "loaded": self.loaded,
        }