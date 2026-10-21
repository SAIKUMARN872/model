from __future__ import annotations

from dataclasses import dataclass


DEFAULT_MODEL_NAME = "nomic-ai/nomic-embed-text-v1.5"
DEFAULT_DIMENSION = 768
DEFAULT_BATCH_SIZE = 32
MAX_BATCH_SIZE = 512
DEFAULT_MAX_SEQUENCE_LENGTH = 8192

DEFAULT_DOCUMENT_PREFIX = "search_document: "
DEFAULT_QUERY_PREFIX = "search_query: "

SUPPORTED_TASKS = (
    "search_document",
    "search_query",
    "classification",
    "clustering",
)


@dataclass(frozen=True, slots=True)
class NomicModelInfo:
    name: str = DEFAULT_MODEL_NAME
    dimension: int = DEFAULT_DIMENSION
    max_sequence_length: int = DEFAULT_MAX_SEQUENCE_LENGTH
    provider: str = "nomic"
    supports_matryoshka: bool = True


@dataclass(frozen=True, slots=True)
class NomicConfig:
    model_name: str = DEFAULT_MODEL_NAME
    device: str | None = None
    batch_size: int = DEFAULT_BATCH_SIZE
    normalize_embeddings: bool = True
    dimension: int | None = None
    max_sequence_length: int = DEFAULT_MAX_SEQUENCE_LENGTH
    trust_remote_code: bool = True
    document_prefix: str = DEFAULT_DOCUMENT_PREFIX
    query_prefix: str = DEFAULT_QUERY_PREFIX
