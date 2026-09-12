"""
Exceptions for the embeddings subsystem.
"""


class EmbeddingError(Exception):
    """Base embedding exception."""


class EmbeddingConfigurationError(
    EmbeddingError
):
    """Invalid embedding configuration."""


class EmbeddingProviderError(
    EmbeddingError
):
    """Embedding provider error."""


class EmbeddingProviderNotFoundError(
    EmbeddingProviderError
):
    """Requested provider does not exist."""


class EmbeddingModelError(
    EmbeddingProviderError
):
    """Embedding model loading/inference error."""


class EmbeddingValidationError(
    EmbeddingError
):
    """Invalid embedding input/output."""


class EmbeddingDimensionError(
    EmbeddingValidationError
):
    """Embedding dimensions are invalid."""


class EmbeddingBatchError(
    EmbeddingError
):
    """Batch embedding operation failed."""


class SimilarityError(
    EmbeddingError
):
    """Similarity calculation failed."""