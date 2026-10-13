from __future__ import annotations

from dataclasses import dataclass


DEFAULT_MODEL_NAME = "voyage-3.5"
DEFAULT_BATCH_SIZE = 64
MAX_BATCH_SIZE = 1000


@dataclass(frozen=True, slots=True)
class VoyageEmbeddingConfig:
    model_name: str = DEFAULT_MODEL_NAME
    output_dimension: int | None = None
    batch_size: int = DEFAULT_BATCH_SIZE
    normalize_embeddings: bool = False
    api_key: str | None = None
    timeout: float = 30.0
    max_retries: int = 2
