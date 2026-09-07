"""
Redis client configuration.
"""

from __future__ import annotations

from typing import Optional

from redis.asyncio import Redis

from app.core.config import settings

_redis: Optional[Redis] = None


async def get_redis() -> Redis:
    """
    Return a singleton Redis client.
    """
    global _redis

    if _redis is None:
        _redis = Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            password=settings.REDIS_PASSWORD,
            decode_responses=True,
        )

    return _redis


async def close_redis() -> None:
    """
    Close the Redis connection.
    """
    global _redis

    if _redis is not None:
        await _redis.close()
        _redis = None


class RedisClient:
    """
    Wrapper around Redis client.
    """

    @staticmethod
    async def client() -> Redis:
        return await get_redis()

    @staticmethod
    async def ping() -> bool:
        redis = await get_redis()
        return await redis.ping()

    @staticmethod
    async def close() -> None:
        await close_redis()