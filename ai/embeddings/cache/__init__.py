"""Embedding cache public API."""

from .cache import EmbeddingCache, EmbeddingCacheStats
from .memory_cache import MemoryEmbeddingCache, CacheStats
from .redis_cache import RedisEmbeddingCache
from .utils import (
    make_cache_key,
    validate_cache_text,
    validate_embedding,
    serialize_embedding,
    deserialize_embedding,
)

__all__ = [
    "EmbeddingCache",
    "EmbeddingCacheStats",
    "MemoryEmbeddingCache",
    "CacheStats",
    "RedisEmbeddingCache",
    "make_cache_key",
    "validate_cache_text",
    "validate_embedding",
    "serialize_embedding",
    "deserialize_embedding",
]
