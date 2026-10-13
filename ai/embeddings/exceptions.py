class EmbeddingError(Exception):
    """Base embedding error."""

class EmbeddingValidationError(EmbeddingError, ValueError):
    """Invalid embedding input or output."""

class EmbeddingProviderError(EmbeddingError):
    """Embedding provider failure."""

class EmbeddingDimensionError(EmbeddingValidationError):
    """Embedding dimensions are inconsistent."""
