"""
BGE model client.

This module isolates SentenceTransformers/model loading from
the rest of the application.
"""

from __future__ import annotations

from typing import Any

from .models import BGEConfig
from .utils import (
    normalize_embeddings,
    validate_embeddings,
    validate_texts,
)


class BGEClientError(
    Exception
):
    """Base BGE client exception."""


class BGELoadError(
    BGEClientError
):
    """Raised when a BGE model cannot be loaded."""


class BGEClient:
    """
    Client around SentenceTransformers BGE models.

    The dependency is loaded lazily so importing the package
    does not require sentence-transformers to already be loaded.
    """

    def __init__(
        self,
        config: BGEConfig | None = None,
    ) -> None:

        self.config = (
            config
            or BGEConfig()
        )

        self._model: Any = None

    # --------------------------------------------------
    # Model lifecycle
    # --------------------------------------------------

    def load(self) -> Any:
        """
        Load the BGE model lazily.
        """

        if self._model is not None:
            return self._model

        try:

            from sentence_transformers import (
                SentenceTransformer,
            )

        except ImportError as exc:

            raise BGELoadError(
                "sentence-transformers is required "
                "for the BGE provider. Install it with "
                "'pip install sentence-transformers'."
            ) from exc

        try:

            kwargs = dict(
                self.config.model_kwargs
            )

            if (
                self.config.cache_folder
                is not None
            ):

                kwargs[
                    "cache_folder"
                ] = self.config.cache_folder

            kwargs[
                "trust_remote_code"
            ] = self.config.trust_remote_code

            self._model = SentenceTransformer(
                self.config.model_name,
                device=self.config.device,
                **kwargs,
            )

            # Set transformer max sequence length when
            # supported by SentenceTransformers.
            if hasattr(
                self._model,
                "max_seq_length",
            ):

                self._model.max_seq_length = (
                    self.config.max_length
                )

            return self._model

        except Exception as exc:

            raise BGELoadError(
                f"Failed to load BGE model "
                f"'{self.config.model_name}': "
                f"{exc}"
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

            raise BGEClientError(
                f"BGE encoding failed: {exc}"
            ) from exc

        # SentenceTransformers may return a numpy array.
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

    def encode_query(
        self,
        text: str,
    ) -> list[float]:

        results = self.encode(
            [text]
        )

        return results[0]

    def encode_documents(
        self,
        texts: list[str],
    ) -> list[list[float]]:

        return self.encode(
            texts
        )

    # --------------------------------------------------
    # Information
    # --------------------------------------------------

    def dimension(self) -> int:

        embedding = self.encode_query(
            "dimension test"
        )

        return len(
            embedding
        )

    def info(self) -> dict[str, Any]:

        return {
            "model_name": (
                self.config.model_name
            ),
            "device": self.config.device,
            "max_length": (
                self.config.max_length
            ),
            "batch_size": (
                self.config.batch_size
            ),
            "normalize_embeddings": (
                self.config.normalize_embeddings
            ),
            "loaded": self.loaded,
        }