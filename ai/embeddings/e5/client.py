"""
Low-level E5 embedding client.
"""

from __future__ import annotations

from typing import Any

from .models import E5Config


class E5Client:
    """
    Client for E5 embedding models.

    Dependency:

        pip install sentence-transformers
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

    def load(self) -> None:

        if self._model is not None:
            return

        try:

            from sentence_transformers import (
                SentenceTransformer,
            )

        except ImportError as exc:

            raise ImportError(
                "sentence-transformers is required "
                "for E5 embeddings. Install it with: "
                "pip install sentence-transformers"
            ) from exc

        kwargs = dict(
            self.config.model_kwargs
        )

        kwargs.setdefault(
            "device",
            self.config.device,
        )

        self._model = SentenceTransformer(
            self.config.model_name,
            **kwargs,
        )

    @property
    def model(self) -> Any:

        self.load()

        return self._model

    def encode(
        self,
        texts: list[str],
    ) -> list[list[float]]:

        if not texts:
            return []

        self.load()

        embeddings = self._model.encode(
            texts,
            batch_size=self.config.batch_size,
            normalize_embeddings=(
                self.config.normalize_embeddings
            ),
            show_progress_bar=False,
        )

        return [
            vector.tolist()
            for vector in embeddings
        ]

    def encode_one(
        self,
        text: str,
    ) -> list[float]:

        result = self.encode(
            [text]
        )

        return (
            result[0]
            if result
            else []
        )

    def dimension(self) -> int:

        self.load()

        return int(
            self._model
            .get_sentence_embedding_dimension()
        )