"""
E5 embedding provider package.
"""

from .client import (
    E5Client,
)

from .models import (
    E5Config,
    E5Embedding,
    E5EmbeddingResponse,
)

from .provider import (
    E5Provider,
)

from .utils import (
    add_passage_prefix,
    add_query_prefix,
    normalize_vector,
    validate_vector,
    vector_dimension,
)


__all__ = [
    "E5Client",
    "E5Config",
    "E5Embedding",
    "E5EmbeddingResponse",
    "E5Provider",
    "add_passage_prefix",
    "add_query_prefix",
    "normalize_vector",
    "validate_vector",
    "vector_dimension",
]