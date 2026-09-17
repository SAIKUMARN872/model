"""
BGE embedding provider package.
"""

from .client import (
    BGEClient,
)

from .models import (
    BGEConfig,
    BGEEmbedding,
    BGEEmbeddingResponse,
)

from .provider import (
    BGEProvider,
)

from .utils import (
    normalize_vector,
    validate_vector,
    vector_dimension,
)


__all__ = [
    "BGEClient",
    "BGEConfig",
    "BGEEmbedding",
    "BGEEmbeddingResponse",
    "BGEProvider",
    "normalize_vector",
    "validate_vector",
    "vector_dimension",
]