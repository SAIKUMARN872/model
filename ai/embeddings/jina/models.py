"""Configuration and metadata for Jina embedding models."""

from dataclasses import dataclass


DEFAULT_MODEL_NAME = "jinaai/jina-embeddings-v2-base-en"
DEFAULT_BATCH_SIZE = 32
MAX_BATCH_SIZE = 512
DEFAULT_MAX_SEQUENCE_LENGTH = 8192
DEFAULT_DIMENSION = 768
DEFAULT_NORMALIZE = True


@dataclass(frozen=True, slots=True)
class JinaModelInfo:
    model_name: str = DEFAULT_MODEL_NAME
    dimension: int = DEFAULT_DIMENSION
    max_sequence_length: int = DEFAULT_MAX_SEQUENCE_LENGTH
    supports_query_prefix: bool = True
    supports_document_prefix: bool = True


@dataclass(frozen=True, slots=True)
class JinaProviderConfig:
    model_name: str = DEFAULT_MODEL_NAME
    device: str | None = None
    batch_size: int = DEFAULT_BATCH_SIZE
    max_batch_size: int = MAX_BATCH_SIZE
    max_sequence_length: int = DEFAULT_MAX_SEQUENCE_LENGTH
    normalize_embeddings: bool = DEFAULT_NORMALIZE
    trust_remote_code: bool = True
