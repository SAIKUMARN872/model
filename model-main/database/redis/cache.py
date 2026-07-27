"""
Redis cache service.
"""

from __future__ import annotations

import json
from typing import Any, Optional

from redis.asyncio import Redis

from .client import get_redis


class CacheService:
    """
    Redis cache service.
    """

    def __init__(self, redis: Redis):
        self.redis = redis

    async def get(self, key: str) -> Optional[Any]:
        """
        Get a value from cache.
        """
        value = await self.redis.get(key)

        if value is None:
            return None

        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return value.decode("utf-8")

    async def set(
        self,
        key: str,
        value: Any,
        expire: int | None = None,
    ) -> bool:
        """
        Store a value in cache.
        """
        if not isinstance(value, str):
            value = json.dumps(value, default=str)

        return await self.redis.set(
            key,
            value,
            ex=expire,
        )

    async def delete(self, key: str) -> int:
        """
        Delete a cache key.
        """
        return await self.redis.delete(key)

    async def exists(self, key: str) -> bool:
        """
        Check whether a key exists.
        """
        return await self.redis.exists(key) > 0

    async def expire(
        self,
        key: str,
        seconds: int,
    ) -> bool:
        """
        Set expiration for a key.
        """
        return await self.redis.expire(
            key,
            seconds,
        )

    async def ttl(self, key: str) -> int:
        """
        Get remaining TTL.
        """
        return await self.redis.ttl(key)

    async def increment(
        self,
        key: str,
        amount: int = 1,
    ) -> int:
        """
        Increment a numeric value.
        """
        return await self.redis.incr(
            key,
            amount,
        )

    async def decrement(
        self,
        key: str,
        amount: int = 1,
    ) -> int:
        """
        Decrement a numeric value.
        """
        return await self.redis.decr(
            key,
            amount,
        )

    async def clear(self) -> None:
        """
        Remove all keys from the current Redis database.
        """
        await self.redis.flushdb()


async def cache_get(
    key: str,
) -> Optional[Any]:
    """
    Convenience function to retrieve a cached value.
    """
    redis = await get_redis()
    cache = CacheService(redis)
    return await cache.get(key)


async def cache_set(
    key: str,
    value: Any,
    expire: int | None = None,
) -> bool:
    """
    Convenience function to cache a value.
    """
    redis = await get_redis()
    cache = CacheService(redis)
    return await cache.set(
        key,
        value,
        expire,
    )


async def cache_delete(
    key: str,
) -> int:
    """
    Convenience function to delete a cached value.
    """
    redis = await get_redis()
    cache = CacheService(redis)
    return await cache.delete(key)