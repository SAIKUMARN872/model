"""
Voyage AI embedding provider.
"""

from .client import (
    VoyageClient,
    VoyageClientError,
)

from .models import (
    VoyageConfig,
    VoyageEmbedding,
    VoyageEmbeddingResponse,
    VoyageUsage,
)

from .provider import (
    VoyageProvider,
)

from .utils import (
    cosine_similarity,
    estimate_tokens,
    estimate_tokens_batch,
    get_api_key,
    get_dimensions,
    normalize_embeddings,
    normalize_vector,
    validate_embeddings,
    validate_text,
    validate_texts,
)


__all__ = [
    "VoyageConfig",
    "VoyageEmbedding",
    "VoyageEmbeddingResponse",
    "VoyageUsage",
    "VoyageClient",
    "VoyageClientError",
    "VoyageProvider",
    "validate_text",
    "validate_texts",
    "validate_embeddings",
    "get_api_key",
    "estimate_tokens",
    "estimate_tokens_batch",
    "normalize_vector",
    "normalize_embeddings",
    "get_dimensions",
    "cosine_similarity",
]


__version__ = "1.0.0"