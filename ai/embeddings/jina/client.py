"""
Low-level Jina model client.
"""

from __future__ import annotations

from typing import Any

from .models import JinaConfig
from .utils import (
    normalize_embeddings,
    validate_embeddings,
    validate_texts,
)


class JinaClientError(Exception):
    """Base Jina client exception."""


class JinaLoadError(JinaClientError):
    """Raised when the Jina model cannot be loaded."""


class JinaClient:
    """
    Lazy-loading Jina client.

    Uses SentenceTransformers-compatible models.
    """

    def __init__(
        self,
        config: JinaConfig | None = None,
    ) -> None:

        self.config = (
            config
            or JinaConfig()
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
            raise JinaLoadError(
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
            raise JinaLoadError(
                f"Failed to load Jina model "
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

        texts = validate_texts(texts)

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

            if (
                self.config.task
                and hasattr(
                    model,
                    "encode",
                )
            ):
                try:
                    embeddings = model.encode(
                        texts,
                        task=self.config.task,
                        **kwargs,
                    )
                except TypeError:
                    embeddings = model.encode(
                        texts,
                        **kwargs,
                    )
            else:
                embeddings = model.encode(
                    texts,
                    **kwargs,
                )

        except Exception as exc:

            raise JinaClientError(
                f"Jina encoding failed: {exc}"
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

        if (
            self.config.truncate_dim
            and self.config.truncate_dim
            < len(embeddings[0])
        ):

            embeddings = [
                vector[
                    :self.config.truncate_dim
                ]
                for vector in embeddings
            ]

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
            "provider": "jina",
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