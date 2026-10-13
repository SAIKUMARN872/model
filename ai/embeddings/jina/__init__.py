"""Public API for ModelNow Jina embeddings."""

from .client import JinaEmbeddingClient
from .models import (
    DEFAULT_BATCH_SIZE,
    DEFAULT_DIMENSION,
    DEFAULT_MAX_SEQUENCE_LENGTH,
    DEFAULT_MODEL_NAME,
    JinaModelInfo,
    JinaProviderConfig,
)
from .provider import JinaEmbeddingProvider
from .utils import (
    prepare_document,
    prepare_documents,
    prepare_queries,
    prepare_query,
    validate_batch_size,
    validate_text,
    validate_texts,
    validate_vector,
)

__all__ = [
    "DEFAULT_BATCH_SIZE",
    "DEFAULT_DIMENSION",
    "DEFAULT_MAX_SEQUENCE_LENGTH",
    "DEFAULT_MODEL_NAME",
    "JinaEmbeddingClient",
    "JinaEmbeddingProvider",
    "JinaModelInfo",
    "JinaProviderConfig",
    "prepare_document",
    "prepare_documents",
    "prepare_queries",
    "prepare_query",
    "validate_batch_size",
    "validate_text",
    "validate_texts",
    "validate_vector",
]
