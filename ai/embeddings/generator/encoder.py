"""Adapter for ModelNow embedding providers and engines."""

from collections.abc import Sequence
from typing import Any

from .utils import validate_texts, validate_vectors


class EmbeddingEncoder:
    """Generate validated embeddings using an injected provider or engine.

    The backend must expose one of:
      * embed_texts(texts, normalize=...)
      * embed(texts, normalize=...)
      * embed_passages(texts)

    A backend that returns an EmbeddingResult-like object with an `embeddings`
    attribute is supported as well.
    """

    def __init__(
        self,
        backend: Any,
        *,
        normalize: bool = True,
        model_name: str | None = None,
    ) -> None:
        if backend is None:
            raise ValueError("backend is required")
        if not isinstance(normalize, bool):
            raise TypeError("normalize must be a boolean")
        if model_name is not None and (
            not isinstance(model_name, str) or not model_name.strip()
        ):
            raise ValueError("model_name must be None or a non-empty string")

        self.backend = backend
        self.normalize = normalize
        self.model_name = model_name or getattr(backend, "model_name", None)

    def encode(self, texts: Sequence[str]) -> list[list[float]]:
        items = validate_texts(texts)
        if not items:
            return []

        if hasattr(self.backend, "embed_texts"):
            output = self.backend.embed_texts(items, normalize=self.normalize)
        elif hasattr(self.backend, "embed"):
            output = self.backend.embed(items, normalize=self.normalize)
        elif hasattr(self.backend, "embed_passages"):
            output = self.backend.embed_passages(items)
        else:
            raise TypeError(
                "backend must implement embed_texts, embed, or embed_passages"
            )

        if hasattr(output, "embeddings"):
            output = output.embeddings
        elif hasattr(output, "vectors"):
            output = output.vectors

        if hasattr(output, "tolist"):
            output = output.tolist()

        vectors = validate_vectors(
            output,
            expected_count=len(items),
            normalize=False,
        )

        # Normalize here only when the backend did not promise normalized output.
        # Providers accepting the normalize argument receive our requested setting.
        if self.normalize and not (
            hasattr(self.backend, "embed_texts") or hasattr(self.backend, "embed")
        ):
            vectors = validate_vectors(vectors, len(items), normalize=True)

        return vectors

    def encode_one(self, text: str) -> list[float]:
        return self.encode([text])[0]

    def close(self) -> None:
        close = getattr(self.backend, "close", None)
        if callable(close):
            close()
