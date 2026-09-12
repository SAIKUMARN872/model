"""
Nomic embedding provider.
"""

from .client import (
    NomicClient,
    NomicClientError,
    NomicLoadError,
)

from .models import (
    NomicConfig,
    NomicEmbedding,
    NomicEmbeddingResponse,
    NomicUsage,
)

from .provider import (
    NomicProvider,
)

from .utils import (
    cosine_similarity,
    estimate_tokens,
    estimate_tokens_batch,
    get_dimensions,
    normalize_embeddings,
    normalize_vector,
    prepare_document,
    prepare_documents,
    prepare_query,
    prepare_queries,
    validate_embeddings,
    validate_text,
    validate_texts,
)


__all__ = [
    "NomicConfig",
    "NomicEmbedding",
    "NomicEmbeddingResponse",
    "NomicUsage",
    "NomicClient",
    "NomicClientError",
    "NomicLoadError",
    "NomicProvider",
    "validate_text",
    "validate_texts",
    "validate_embeddings",
    "estimate_tokens",
    "estimate_tokens_batch",
    "normalize_vector",
    "normalize_embeddings",
    "get_dimensions",
    "prepare_query",
    "prepare_queries",
    "prepare_document",
    "prepare_documents",
    "cosine_similarity",
]


__version__ = "1.0.0"