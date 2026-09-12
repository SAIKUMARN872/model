"""
BGE embedding provider package.

Supports BAAI BGE models through SentenceTransformers.
"""

from .client import (
    BGEClient,
    BGEClientError,
    BGELoadError,
)

from .models import (
    BGEConfig,
    BGEEmbedding,
    BGEEmbeddingResponse,
    BGEUsage,
)

from .provider import (
    BGEProvider,
    BGEProviderError,
)

from .utils import (
    build_query_text,
    estimate_tokens,
    estimate_tokens_batch,
    get_dimensions,
    normalize_embeddings,
    normalize_vector,
    prepare_documents,
    validate_embedding if False else validate_text,
    validate_texts,
)


__all__ = [
    # Configuration
    "BGEConfig",

    # Models
    "BGEEmbedding",
    "BGEEmbeddingResponse",
    "BGEUsage",

    # Client
    "BGEClient",
    "BGEClientError",
    "BGELoadError",

    # Provider
    "BGEProvider",
    "BGEProviderError",

    # Utilities
    "estimate_tokens",
    "estimate_tokens_batch",
    "normalize_vector",
    "normalize_embeddings",
    "validate_text",
    "validate_texts",
    "prepare_documents",
    "get_dimensions",
    "build_query_text",
]


__version__ = "1.0.0"