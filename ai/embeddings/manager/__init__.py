"""
Embedding provider management package.
"""

from .factory import (
    ProviderFactory,
)

from .manager import (
    EmbeddingManager,
    ProviderInfo,
)

from .registry import (
    ProviderAlreadyRegisteredError,
    ProviderNotFoundError,
    ProviderRegistry,
)

from .utils import (
    get_embedding,
    get_embeddings,
    get_provider_dimension,
    normalize_provider_name,
    validate_provider,
)


__all__ = [
    "EmbeddingManager",
    "ProviderInfo",
    "ProviderFactory",
    "ProviderRegistry",
    "ProviderAlreadyRegisteredError",
    "ProviderNotFoundError",
    "normalize_provider_name",
    "validate_provider",
    "get_embedding",
    "get_embeddings",
    "get_provider_dimension",
]