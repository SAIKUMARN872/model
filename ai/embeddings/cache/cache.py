"""
Unified cache interface for ModelNow.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol

from .memory_cache import (
    MemoryCache,
)
from .redis_cache import (
    RedisCache,
)
from .utils import (
    make_cache_key,
    normalize_key,
    normalize_ttl,
)


class CacheBackend(Protocol):
    """Protocol implemented by cache backends."""

    def get(
        self,
        key: str,
        default: Any = None,
    ) -> Any:
        ...

    def set(
        self,
        key: str,
        value: Any,
        ttl: float | None = None,
    ) -> bool:
        ...

    def delete(
        self,
        key: str,
    ) -> bool:
        ...

    def exists(
        self,
        key: str,
    ) -> bool:
        ...

    def clear(self) -> None:
        ...


@dataclass
class CacheConfig:
    """
    Configuration for the unified cache.
    """

    namespace: str = "modelnow"

    default_ttl: float | None = 3600.0

    use_memory: bool = True

    use_redis: bool = False

    memory_max_size: int = 1000

    memory_max_bytes: int | None = None

    redis_host: str = "localhost"

    redis_port: int = 6379

    redis_db: int = 0

    redis_password: str | None = None

    redis_prefix: str = "modelnow"

    fallback_to_memory: bool = True

    def __post_init__(self) -> None:

        self.default_ttl = normalize_ttl(
            self.default_ttl
        )

        if not self.namespace:

            raise ValueError(
                "namespace cannot be empty"
            )

        if self.memory_max_size <= 0:

            raise ValueError(
                "memory_max_size must be positive"
            )


class Cache:
    """
    Unified cache abstraction.

    Backend behavior:

        Memory only:
            memory cache

        Redis only:
            Redis cache

        Memory + Redis:
            memory -> Redis

    The memory layer acts as a fast L1 cache.
    Redis acts as the shared L2 cache.
    """

    def __init__(
        self,
        config: CacheConfig | None = None,
        memory_backend: MemoryCache | None = None,
        redis_backend: RedisCache | None = None,
    ) -> None:

        self.config = (
            config
            or CacheConfig()
        )

        self.memory: MemoryCache | None = None

        self.redis: RedisCache | None = None

        if self.config.use_memory:

            self.memory = (
                memory_backend
                or MemoryCache(
                    max_size=(
                        self.config.memory_max_size
                    ),
                    max_memory_bytes=(
                        self.config.memory_max_bytes
                    ),
                )
            )

        if self.config.use_redis:

            self.redis = (
                redis_backend
                or RedisCache(
                    host=self.config.redis_host,
                    port=self.config.redis_port,
                    db=self.config.redis_db,
                    password=self.config.redis_password,
                    prefix=self.config.redis_prefix,
                )
            )

    # --------------------------------------------------
    # Key handling
    # --------------------------------------------------

    def build_key(
        self,
        key: Any,
    ) -> str:

        normalized = normalize_key(
            key
        )

        return make_cache_key(
            self.config.namespace,
            normalized,
        )

    # --------------------------------------------------
    # Get
    # --------------------------------------------------

    def get(
        self,
        key: Any,
        default: Any = None,
    ) -> Any:

        cache_key = self.build_key(
            key
        )

        # L1 memory.
        if self.memory is not None:

            value = self.memory.get(
                cache_key,
                default=None,
            )

            if value is not None:

                return value

        # L2 Redis.
        if self.redis is not None:

            try:

                value = self.redis.get(
                    cache_key,
                    default=None,
                )

                if value is not None:

                    # Populate L1.
                    if self.memory is not None:

                        self.memory.set(
                            cache_key,
                            value,
                            ttl=self.config.default_ttl,
                        )

                    return value

            except Exception:

                if not self.config.fallback_to_memory:

                    raise

        return default

    # --------------------------------------------------
    # Set
    # --------------------------------------------------

    def set(
        self,
        key: Any,
        value: Any,
        ttl: float | None = None,
    ) -> bool:

        cache_key = self.build_key(
            key
        )

        if ttl is None:

            ttl = self.config.default_ttl

        ttl = normalize_ttl(
            ttl
        )

        success = False

        if self.memory is not None:

            self.memory.set(
                cache_key,
                value,
                ttl=ttl,
            )

            success = True

        if self.redis is not None:

            try:

                self.redis.set(
                    cache_key,
                    value,
                    ttl=ttl,
                )

                success = True

            except Exception:

                if not self.config.fallback_to_memory:

                    raise

        return success

    # --------------------------------------------------
    # Delete
    # --------------------------------------------------

    def delete(
        self,
        key: Any,
    ) -> bool:

        cache_key = self.build_key(
            key
        )

        deleted = False

        if self.memory is not None:

            deleted = (
                self.memory.delete(
                    cache_key
                )
                or deleted
            )

        if self.redis is not None:

            try:

                deleted = (
                    self.redis.delete(
                        cache_key
                    )
                    or deleted
                )

            except Exception:

                if not self.config.fallback_to_memory:

                    raise

        return deleted

    # --------------------------------------------------
    # Exists
    # --------------------------------------------------

    def exists(
        self,
        key: Any,
    ) -> bool:

        cache_key = self.build_key(
            key
        )

        if self.memory is not None:

            if self.memory.exists(
                cache_key
            ):

                return True

        if self.redis is not None:

            try:

                return self.redis.exists(
                    cache_key
                )

            except Exception:

                if not self.config.fallback_to_memory:

                    raise

        return False

    # --------------------------------------------------
    # Get or set
    # --------------------------------------------------

    def get_or_set(
        self,
        key: Any,
        factory,
        ttl: float | None = None,
    ) -> Any:
        """
        Return cached value or calculate and cache it.

        factory may be synchronous. For async workloads,
        use get_or_set_async().
        """

        value = self.get(
            key,
            default=None,
        )

        if value is not None:

            return value

        value = factory()

        self.set(
            key,
            value,
            ttl=ttl,
        )

        return value

    async def get_or_set_async(
        self,
        key: Any,
        factory,
        ttl: float | None = None,
    ) -> Any:
        """
        Async version of get_or_set().
        """

        value = self.get(
            key,
            default=None,
        )

        if value is not None:

            return value

        value = factory()

        if hasattr(
            value,
            "__await__",
        ):

            value = await value

        self.set(
            key,
            value,
            ttl=ttl,
        )

        return value

    # --------------------------------------------------
    # Bulk operations
    # --------------------------------------------------

    def get_many(
        self,
        keys: list[Any],
    ) -> dict[Any, Any]:

        result = {}

        for key in keys:

            value = self.get(
                key,
                default=None,
            )

            if value is not None:

                result[key] = value

        return result

    def set_many(
        self,
        values: dict[Any, Any],
        ttl: float | None = None,
    ) -> None:

        for key, value in values.items():

            self.set(
                key,
                value,
                ttl=ttl,
            )

    def delete_many(
        self,
        keys: list[Any],
    ) -> int:

        deleted = 0

        for key in keys:

            if self.delete(key):

                deleted += 1

        return deleted

    # --------------------------------------------------
    # Maintenance
    # --------------------------------------------------

    def clear(self) -> None:

        if self.memory is not None:

            self.memory.clear()

        if self.redis is not None:

            try:

                self.redis.clear()

            except Exception:

                if not self.config.fallback_to_memory:

                    raise

    # --------------------------------------------------
    # Statistics
    # --------------------------------------------------

    def stats(self) -> dict[str, Any]:

        result = {
            "namespace": self.config.namespace,
            "memory_enabled": (
                self.memory is not None
            ),
            "redis_enabled": (
                self.redis is not None
            ),
        }

        if self.memory is not None:

            result[
                "memory"
            ] = self.memory.stats()

        if self.redis is not None:

            try:

                result[
                    "redis_available"
                ] = self.redis.ping()

            except Exception:

                result[
                    "redis_available"
                ] = False

        return result

    def backend_status(
        self,
    ) -> dict[str, Any]:

        status = {
            "memory": (
                self.memory is not None
            ),
            "redis": (
                self.redis is not None
            ),
        }

        if self.redis is not None:

            try:

                status[
                    "redis_connected"
                ] = self.redis.ping()

            except Exception:

                status[
                    "redis_connected"
                ] = False

        return status