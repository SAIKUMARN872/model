"""High-level embedding generation API."""

from collections.abc import Mapping, Sequence
from typing import Any

from .encoder import EmbeddingEncoder
from .models import GeneratedEmbedding, GenerationConfig
from .utils import validate_metadata, validate_texts


class EmbeddingGenerator:
    """Generate embedding records with stable input ordering and metadata."""

    def __init__(
        self,
        backend: Any,
        config: GenerationConfig | None = None,
    ) -> None:
        if config is not None and not isinstance(config, GenerationConfig):
            raise TypeError("config must be a GenerationConfig")
        self.config = config if config is not None else GenerationConfig()
        if not isinstance(self.config, GenerationConfig):
            raise TypeError("config must be a GenerationConfig")
        self.encoder = EmbeddingEncoder(
            backend,
            normalize=self.config.normalize,
            model_name=self.config.model_name,
        )

    def generate(
        self,
        texts: Sequence[str],
        metadata: Sequence[Mapping[str, Any] | None] | None = None,
    ) -> list[GeneratedEmbedding]:
        items = validate_texts(texts)
        metadata_items = validate_metadata(metadata, len(items))
        if not items:
            return []

        vectors: list[list[float]] = []
        for start in range(0, len(items), self.config.batch_size):
            batch = items[start:start + self.config.batch_size]
            vectors.extend(self.encoder.encode(batch))

        if len(vectors) != len(items):
            raise RuntimeError("Embedding backend returned an unexpected vector count")

        return [
            GeneratedEmbedding(
                text=text,
                vector=list(vectors[index]),
                index=index,
                model_name=self.config.model_name or self.encoder.model_name,
                namespace=self.config.namespace,
                metadata=metadata_items[index],
            )
            for index, text in enumerate(items)
        ]

    def generate_vectors(self, texts: Sequence[str]) -> list[list[float]]:
        return [record.vector for record in self.generate(texts)]

    def generate_one(
        self,
        text: str,
        metadata: Mapping[str, Any] | None = None,
    ) -> GeneratedEmbedding:
        return self.generate([text], [metadata])[0]

    def close(self) -> None:
        self.encoder.close()

    def __enter__(self) -> "EmbeddingGenerator":
        return self

    def __exit__(self, exc_type: Any, exc: Any, traceback: Any) -> None:
        self.close()

