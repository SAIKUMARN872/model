"""
ModelNow Embeddings subsystem.
"""

from .constants import (
    DEFAULT_BATCH_SIZE,
    DEFAULT_MODEL,
    DEFAULT_PROVIDER,
    SUPPORTED_METRICS,
    SUPPORTED_PROVIDERS,
)

from .engine import (
    EmbeddingEngine,
)

from .exceptions import (
    EmbeddingBatchError,
    EmbeddingConfigurationError,
    EmbeddingDimensionError,
    EmbeddingError,
    EmbeddingModelError,
    EmbeddingProviderError,
    EmbeddingProviderNotFoundError,
    EmbeddingValidationError,
    SimilarityError,
)

from .models import (
    EmbeddingBatch,
    EmbeddingConfig,
    EmbeddingVector,
)

from .schemas import (
    EmbeddingRequest,
    EmbeddingResponse,
    SimilarityRequest,
    SimilarityResponse,
)

from .similarity import (
    cosine_similarity,
    dot_product,
    euclidean_distance,
)

from .utils import (
    estimate_tokens,
    estimate_tokens_batch,
    normalize_embeddings,
    normalize_vector,
    validate_dimensions,
    validate_text,
    validate_texts,
)


__all__ = [
    # Engine
    "EmbeddingEngine",

    # Models
    "EmbeddingVector",
    "EmbeddingBatch",
    "EmbeddingConfig",

    # Schemas
    "EmbeddingRequest",
    "EmbeddingResponse",
    "SimilarityRequest",
    "SimilarityResponse",

    # Exceptions
    "EmbeddingError",
    "EmbeddingConfigurationError",
    "EmbeddingProviderError",
    "EmbeddingProviderNotFoundError",
    "EmbeddingModelError",
    "EmbeddingValidationError",
    "EmbeddingDimensionError",
    "EmbeddingBatchError",
    "SimilarityError",

    # Constants
    "DEFAULT_PROVIDER",
    "DEFAULT_MODEL",
    "DEFAULT_BATCH_SIZE",
    "SUPPORTED_PROVIDERS",
    "SUPPORTED_METRICS",

    # Similarity
    "cosine_similarity",
    "dot_product",
    "euclidean_distance",

    # Utilities
    "validate_text",
    "validate_texts",
    "validate_dimensions",
    "normalize_vector",
    "normalize_embeddings",
    "estimate_tokens",
    "estimate_tokens_batch",
]


__version__ = "1.0.0"