"""
Redis session management.
"""

from __future__ import annotations

import json
from typing import Any

from redis.asyncio import Redis

from .client import get_redis


class RedisSession:
    """
    Redis-backed session manager.
    """

    def __init__(self, redis: Redis):
        self.redis = redis

    async def create(
        self,
        session_id: str,
        data: dict[str, Any],
        expire: int = 3600,
    ) -> bool:
        """
        Create a new session.
        """
        return await self.redis.set(
            session_id,
            json.dumps(data),
            ex=expire,
        )

    async def get(
        self,
        session_id: str,
    ) -> dict[str, Any] | None:
        """
        Retrieve a session.
        """
        value = await self.redis.get(session_id)

        if value is None:
            return None

        return json.loads(value)

    async def update(
        self,
        session_id: str,
        data: dict[str, Any],
        expire: int = 3600,
    ) -> bool:
        """
        Update an existing session.
        """
        return await self.redis.set(
            session_id,
            json.dumps(data),
            ex=expire,
        )

    async def delete(
        self,
        session_id: str,
    ) -> int:
        """
        Delete a session.
        """
        return await self.redis.delete(session_id)

    async def exists(
        self,
        session_id: str,
    ) -> bool:
        """
        Check whether a session exists.
        """
        return await self.redis.exists(session_id) > 0

    async def expire(
        self,
        session_id: str,
        seconds: int,
    ) -> bool:
        """
        Update session expiration.
        """
        return await self.redis.expire(
            session_id,
            seconds,
        )

    async def ttl(
        self,
        session_id: str,
    ) -> int:
        """
        Get remaining session lifetime.
        """
        return await self.redis.ttl(session_id)

    async def clear(self) -> None:
        """
        Remove all sessions from the current Redis database.
        """
        await self.redis.flushdb()


async def get_session() -> RedisSession:
    """
    Return a Redis session manager instance.
    """
    redis = await get_redis()
    return RedisSession(redis)