"""Optional embedding adapter for the ingestion pipeline."""

from __future__ import annotations

from collections.abc import Callable, Sequence
import math
from typing import Any


EmbeddingFunction = Callable[[Sequence[str]], Any]


class IngestionEmbeddingAdapter:
    """Adapt an injected batch embedding function to validated vectors."""

    def __init__(self, embed_batch: EmbeddingFunction) -> None:
        if not callable(embed_batch):
            raise TypeError("embed_batch must be callable")
        self.embed_batch = embed_batch

    def embed(self, texts: Sequence[str]) -> list[list[float]]:
        if isinstance(texts, (str, bytes)):
            raise TypeError("texts must be a sequence of strings")
        if not texts:
            return []
        if any(not isinstance(text, str) or not text.strip() for text in texts):
            raise ValueError("Every text must be a non-empty string")

        raw_vectors = self.embed_batch(texts)
        vectors = [[float(value) for value in vector] for vector in raw_vectors]

        if len(vectors) != len(texts):
            raise ValueError("Embedding count must match text count")
        if not vectors:
            raise ValueError("Embedding function returned no vectors")

        dimension = len(vectors[0])
        if dimension == 0:
            raise ValueError("Embedding vectors cannot be empty")

        for vector in vectors:
            if len(vector) != dimension:
                raise ValueError("All embedding vectors must have equal dimensions")
            if not all(math.isfinite(value) for value in vector):
                raise ValueError("Embedding values must be finite")

        return vectors
