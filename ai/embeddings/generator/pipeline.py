"""Convenience pipeline for batched embedding generation."""

from collections.abc import Mapping, Sequence
from typing import Any

from .generator import EmbeddingGenerator
from .models import GeneratedEmbedding, GenerationConfig


class EmbeddingPipeline:
    """Validate, batch, encode, and return embedding records."""

    def __init__(
        self,
        backend: Any,
        config: GenerationConfig | None = None,
    ) -> None:
        self.generator = EmbeddingGenerator(backend, config)

    def run(
        self,
        texts: Sequence[str],
        metadata: Sequence[Mapping[str, Any] | None] | None = None,
    ) -> list[GeneratedEmbedding]:
        return self.generator.generate(texts, metadata)

    def run_vectors(self, texts: Sequence[str]) -> list[list[float]]:
        return self.generator.generate_vectors(texts)

    def close(self) -> None:
        self.generator.close()

    def __enter__(self) -> "EmbeddingPipeline":
        return self

    def __exit__(self, exc_type: Any, exc: Any, traceback: Any) -> None:
        self.close()
