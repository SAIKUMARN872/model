from __future__ import annotations

from dataclasses import dataclass


DEFAULT_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
DEFAULT_DIMENSION = 384
DEFAULT_BATCH_SIZE = 32
MAX_BATCH_SIZE = 512
DEFAULT_MAX_SEQUENCE_LENGTH = 512
DEFAULT_DEVICE = None


@dataclass(frozen=True, slots=True)
class SentenceTransformerConfig:
    model_name: str = DEFAULT_MODEL_NAME
    device: str | None = DEFAULT_DEVICE
    batch_size: int = DEFAULT_BATCH_SIZE
    normalize_embeddings: bool = True
    dimension: int | None = None
    max_sequence_length: int = DEFAULT_MAX_SEQUENCE_LENGTH
    trust_remote_code: bool = False
    show_progress_bar: bool = False


@dataclass(frozen=True, slots=True)
class SentenceTransformerModelInfo:
    name: str
    dimension: int
    max_sequence_length: int
    provider: str = "sentence-transformers"
