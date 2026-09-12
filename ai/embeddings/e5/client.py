"""
Client for loading and executing E5 models.
"""

from __future__ import annotations

from typing import Any

from .models import E5Config
from .utils import (
    normalize_embeddings,
    validate_embeddings,
    validate_texts,
)


class E5ClientError(
    Exception
):
    """Base E5 client exception."""


class E5LoadError(
    E5ClientError
):
    """Raised when an E5 model cannot be loaded."""


class E5Client:
    """
    Low-level E5 client using SentenceTransformers.

    The model is loaded lazily on first use.
    """

    def __init__(
        self,
        config: E5Config | None = None,
    ) -> None:

        self.config = (
            config
            or E5Config()
        )

        self._model: Any = None

    # --------------------------------------------------
    # Lifecycle
    # --------------------------------------------------

    def load(self) -> Any:
        """
        Load the configured E5 model.
        """

        if self._model is not None:
            return self._model

        try:

            from sentence_transformers import (
                SentenceTransformer,
            )

        except ImportError as exc:

            raise E5LoadError(
                "sentence-transformers is required "
                "for the E5 provider. Install it with "
                "'pip install sentence-transformers'."
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

            raise E5LoadError(
                f"Failed to load E5 model "
                f"'{self.config.model_name}': {exc}"
            ) from exc

    def unload(self) -> None:
        """
        Release the model reference.
        """

        self._model = None

    @property
    def loaded(self) -> bool:
        return self._model is not None

    @property
    def model(self) -> Any:
        return self.load()

    # --------------------------------------------------
    # Encoding
    # --------------------------------------------------

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
            self.config.normalize_embeddings,
        )

        kwargs.setdefault(
            "show_progress_bar",
            self.config.show_progress_bar,
        )

        try:

            embeddings = model.encode(
                texts,
                **kwargs,
            )

        except Exception as exc:

            raise E5ClientError(
                f"E5 encoding failed: {exc}"
            ) from exc

        if hasattr(
            embeddings,
            "tolist",
        ):

            embeddings = embeddings.tolist()

        embeddings = validate_embeddings(
            embeddings,
            expected_count=len(texts),
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

    def encode_batch(
        self,
        texts: list[str],
    ) -> list[list[float]]:

        return self.encode(
            texts
        )

    # --------------------------------------------------
    # Model information
    # --------------------------------------------------

    def dimension(self) -> int:

        vector = self.encode_one(
            "dimension test"
        )

        return len(vector)

    def info(self) -> dict[str, Any]:

        return {
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
            "normalize_embeddings": (
                self.config.normalize_embeddings
            ),
            "loaded": self.loaded,
        }