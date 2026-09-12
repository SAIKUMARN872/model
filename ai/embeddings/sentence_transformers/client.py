"""
Low-level Sentence Transformers client.
"""

from __future__ import annotations

from typing import Any

from .models import (
    SentenceTransformerConfig,
)


class SentenceTransformerClientError(
    Exception
):
    """Sentence Transformer client error."""


class SentenceTransformerLoadError(
    SentenceTransformerClientError
):
    """Model loading error."""


class SentenceTransformerClient:
    """
    Wrapper around sentence-transformers.
    """

    def __init__(
        self,
        config: SentenceTransformerConfig | None = None,
    ) -> None:

        self.config = (
            config
            or SentenceTransformerConfig()
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

            raise SentenceTransformerLoadError(
                "sentence-transformers is required. "
                "Install with: "
                "pip install sentence-transformers"
            ) from exc

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

        try:

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

            raise SentenceTransformerLoadError(
                f"Failed to load model "
                f"'{self.config.model_name}': "
                f"{exc}"
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

        if not texts:
            raise ValueError(
                "texts cannot be empty"
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
            "show_progress_bar",
            self.config.show_progress_bar,
        )

        kwargs.setdefault(
            "normalize_embeddings",
            self.config.normalize_embeddings,
        )

        try:

            result = model.encode(
                texts,
                **kwargs,
            )

        except Exception as exc:

            raise SentenceTransformerClientError(
                f"Encoding failed: {exc}"
            ) from exc

        if hasattr(
            result,
            "tolist",
        ):

            result = result.tolist()

        return [
            [
                float(value)
                for value in vector
            ]
            for vector in result
        ]

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
            "provider": (
                "sentence_transformers"
            ),
            "model_name": (
                self.config.model_name
            ),
            "device": (
                self.config.device
            ),
            "batch_size": (
                self.config.batch_size
            ),
            "max_length": (
                self.config.max_length
            ),
            "normalized": (
                self.config.normalize_embeddings
            ),
            "loaded": self.loaded,
        }