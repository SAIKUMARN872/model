"""
Enterprise Cache Service

Features
--------
- Async Cache
- JSON Serialization
- TTL Support
- Delete
- Exists
- Increment
- Pattern Delete
"""

from __future__ import annotations

import json
from typing import Any

from cache.redis import redis_client


class Cache:
    """
    Enterprise Cache Service.
    """

    def __init__(self) -> None:
        self.client = redis_client

    # ---------------------------------------------------------
    # Get
    # ---------------------------------------------------------

    async def get(
        self,
        key: str,
    ) -> Any | None:

        value = await self.client.get(key)

        if value is None:
            return None

        try:
            return json.loads(value)
        except Exception:
            return value

    # ---------------------------------------------------------
    # Set
    # ---------------------------------------------------------

    async def set(
        self,
        key: str,
        value: Any,
        ttl: int | None = None,
    ) -> bool:

        if not isinstance(value, str):
            value = json.dumps(value)

        return await self.client.set(
            key,
            value,
            ex=ttl,
        )

    # ---------------------------------------------------------
    # Delete
    # ---------------------------------------------------------

    async def delete(
        self,
        key: str,
    ) -> bool:

        return bool(
            await self.client.delete(key)
        )

    # ---------------------------------------------------------
    # Exists
    # ---------------------------------------------------------

    async def exists(
        self,
        key: str,
    ) -> bool:

        return bool(
            await self.client.exists(key)
        )

    # ---------------------------------------------------------
    # Expire
    # ---------------------------------------------------------

    async def expire(
        self,
        key: str,
        ttl: int,
    ) -> bool:

        return bool(
            await self.client.expire(
                key,
                ttl,
            )
        )

    # ---------------------------------------------------------
    # Increment
    # ---------------------------------------------------------

    async def increment(
        self,
        key: str,
        amount: int = 1,
    ) -> int:

        return await self.client.incr(
            key,
            amount,
        )

    # ---------------------------------------------------------
    # Decrement
    # ---------------------------------------------------------

    async def decrement(
        self,
        key: str,
        amount: int = 1,
    ) -> int:

        return await self.client.decr(
            key,
            amount,
        )

    # ---------------------------------------------------------
    # Pattern Delete
    # ---------------------------------------------------------

    async def delete_pattern(
        self,
        pattern: str,
    ) -> int:

        keys = []

        async for key in self.client.scan_iter(pattern):
            keys.append(key)

        if not keys:
            return 0

        return await self.client.delete(*keys)

    # ---------------------------------------------------------
    # Flush
    # ---------------------------------------------------------

    async def flush(self) -> None:

        await self.client.flushdb()

    # ---------------------------------------------------------
    # Health Check
    # ---------------------------------------------------------

    async def health(self) -> bool:

        try:
            await self.client.ping()
            return True

        except Exception:
            return False


cache = Cache() 