"""
E5 embedding provider package.

Supports Microsoft/Intfloat E5-family embedding models
through SentenceTransformers.
"""

from .client import (
    E5Client,
    E5ClientError,
    E5LoadError,
)

from .models import (
    E5Config,
    E5Embedding,
    E5EmbeddingResponse,
    E5Usage,
)

from .provider import (
    E5Provider,
    E5ProviderError,
)

from .utils import (
    cosine_similarity,
    cosine_similarity_matrix,
    estimate_tokens,
    estimate_tokens_batch,
    get_dimensions,
    normalize_embeddings,
    normalize_vector,
    prepare_passage,
    prepare_passages,
    prepare_query,
    prepare_queries,
    validate_embeddings,
    validate_text,
    validate_texts,
)


__all__ = [
    # Configuration
    "E5Config",

    # Models
    "E5Embedding",
    "E5EmbeddingResponse",
    "E5Usage",

    # Client
    "E5Client",
    "E5ClientError",
    "E5LoadError",

    # Provider
    "E5Provider",
    "E5ProviderError",

    # Utilities
    "estimate_tokens",
    "estimate_tokens_batch",
    "normalize_vector",
    "normalize_embeddings",
    "validate_text",
    "validate_texts",
    "validate_embeddings",
    "get_dimensions",
    "prepare_query",
    "prepare_queries",
    "prepare_passage",
    "prepare_passages",
    "cosine_similarity",
    "cosine_similarity_matrix",
]


__version__ = "1.0.0"