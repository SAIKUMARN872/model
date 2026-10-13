from __future__ import annotations

from dataclasses import dataclass


DEFAULT_MODEL_NAME = "text-embedding-3-small"
DEFAULT_DIMENSION = 1536
DEFAULT_BATCH_SIZE = 100
MAX_BATCH_SIZE = 2048


@dataclass(frozen=True, slots=True)
class OpenAIEmbeddingConfig:
    model_name: str = DEFAULT_MODEL_NAME
    dimensions: int | None = None
    batch_size: int = DEFAULT_BATCH_SIZE
    normalize_embeddings: bool = False
    api_key: str | None = None
    timeout: float = 30.0
    max_retries: int = 2
