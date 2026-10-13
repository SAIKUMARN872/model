"""Redis-backed asynchronous cache for ModelNow RAG."""

from __future__ import annotations

from typing import Any

from ai.rag.cache.ttl import TTLPolicy
from ai.rag.cache.utils import deserialize_json, make_cache_key, serialize_json


class RedisCache:
    """JSON-serialized Redis cache using server-side key expiration.

    Provide either an existing async Redis client or a Redis URL.
    The caller is responsible for managing a client supplied externally.
    """

    def __init__(
        self,
        *,
        redis_url: str | None = None,
        client: Any | None = None,
        namespace: str = "modelnow:rag",
        default_ttl_seconds: float = 300.0,
        max_ttl_seconds: float = 604800.0,
        key_version: str = "v1",
    ) -> None:
        if client is None and not redis_url:
            raise ValueError("Provide redis_url or an async Redis client.")
        if client is not None and redis_url is not None:
            raise ValueError("Provide either client or redis_url, not both.")
        if not namespace.strip():
            raise ValueError("Redis cache namespace cannot be empty.")

        self._redis_url = redis_url
        self._client = client
        self._owns_client = client is None
        self._namespace = namespace
        self._key_version = key_version
        self._ttl_policy = TTLPolicy(
            default_ttl_seconds=default_ttl_seconds,
            max_ttl_seconds=max_ttl_seconds,
        )

    async def connect(self) -> None:
        """Create and validate an owned Redis connection."""
        if self._client is not None:
            return

        try:
            from redis.asyncio import Redis
        except ImportError as exc:
            raise RuntimeError(
                "Redis support requires the 'redis' package. "
                "Install it with: python -m pip install redis"
            ) from exc

        client = Redis.from_url(
            self._redis_url,
            decode_responses=False,
            socket_connect_timeout=3.0,
            socket_timeout=5.0,
            health_check_interval=30,
        )
        try:
            await client.ping()
        except Exception:
            await client.aclose()
            raise

        self._client = client

    def _require_client(self) -> Any:
        if self._client is None:
            raise RuntimeError("RedisCache is not connected. Call connect() first.")
        return self._client

    def _key(self, key: str) -> str:
        return make_cache_key(
            self._namespace,
            key,
            version=self._key_version,
        )

    async def get(self, key: str) -> Any | None:
        client = self._require_client()
        raw = await client.get(self._key(key))
        if raw is None:
            return None

        try:
            return deserialize_json(raw)
        except (UnicodeDecodeError, ValueError, TypeError):
            # Corrupt or incompatible cache entries should not be served.
            await client.delete(self._key(key))
            return None

    async def set(
        self,
        key: str,
        value: Any,
        ttl_seconds: float | None = None,
    ) -> None:
        client = self._require_client()
        ttl = self._ttl_policy.resolve(ttl_seconds)
        payload = serialize_json(value)

        await client.set(
            self._key(key),
            payload,
            px=max(1, int(ttl * 1000)),
        )

    async def delete(self, key: str) -> bool:
        client = self._require_client()
        return bool(await client.delete(self._key(key)))

    async def clear(self) -> None:
        """Delete keys in this namespace without flushing the Redis database."""
        client = self._require_client()
        pattern = f"{self._namespace}:{self._key_version}:*"

        async for key in client.scan_iter(match=pattern, count=500):
            await client.delete(key)

    async def close(self) -> None:
        """Close only the connection owned by this instance."""
        if self._owns_client and self._client is not None:
            await self._client.aclose()
            self._client = None


__all__ = ["RedisCache"]
