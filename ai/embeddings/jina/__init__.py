"""
Jina embedding provider.
"""

from .client import (
    JinaClient,
    JinaClientError,
    JinaLoadError,
)

from .models import (
    JinaConfig,
    JinaEmbedding,
    JinaEmbeddingResponse,
    JinaUsage,
)

from .provider import (
    JinaProvider,
)

from .utils import (
    cosine_similarity,
    estimate_tokens,
    estimate_tokens_batch,
    get_dimensions,
    normalize_embeddings,
    normalize_vector,
    validate_embeddings,
    validate_text,
    validate_texts,
)


__all__ = [
    "JinaConfig",
    "JinaEmbedding",
    "JinaEmbeddingResponse",
    "JinaUsage",
    "JinaClient",
    "JinaClientError",
    "JinaLoadError",
    "JinaProvider",
    "validate_text",
    "validate_texts",
    "validate_embeddings",
    "estimate_tokens",
    "estimate_tokens_batch",
    "normalize_vector",
    "normalize_embeddings",
    "get_dimensions",
    "cosine_similarity",
]


__version__ = "1.0.0"