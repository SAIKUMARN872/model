"""
ModelNow Cache Package.

Provides:
    - unified cache abstraction
    - in-memory LRU cache
    - Redis cache
    - TTL management
    - cache key generation
    - cache statistics
"""

from .cache import (
    Cache,
    CacheBackend,
    CacheConfig,
)

from .memory_cache import (
    MemoryCache,
    MemoryCacheEntry,
    MemoryCacheStats,
)

from .redis_cache import (
    RedisCache,
    RedisCacheError,
    RedisUnavailableError,
)

from .utils import (
    calculate_expiry,
    current_time,
    deserialize,
    elapsed_seconds,
    estimate_size,
    is_expired,
    make_cache_key,
    make_function_cache_key,
    normalize_key,
    normalize_ttl,
    prepare_value,
    serialize,
)


__all__ = [
    # Unified cache
    "Cache",
    "CacheConfig",
    "CacheBackend",

    # Memory cache
    "MemoryCache",
    "MemoryCacheEntry",
    "MemoryCacheStats",

    # Redis
    "RedisCache",
    "RedisCacheError",
    "RedisUnavailableError",

    # Utilities
    "current_time",
    "elapsed_seconds",
    "is_expired",
    "calculate_expiry",
    "make_cache_key",
    "make_function_cache_key",
    "normalize_key",
    "normalize_ttl",
    "serialize",
    "deserialize",
    "prepare_value",
    "estimate_size",
]


__version__ = "1.0.0"