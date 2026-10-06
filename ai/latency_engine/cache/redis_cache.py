from __future__ import annotations

from typing import Any

from .cache_policy import (
    CachePolicy,
    DEFAULT_CACHE_POLICY,
)
from .utils import (
    deserialize_value,
    serialize_value,
)


class RedisLatencyCache:
    """Redis-backed cache for distributed ModelNow deployments."""

    def __init__(
        self,
        url: str = "redis://localhost:6379/0",
        policy: CachePolicy | None = None,
        client: Any | None = None,
    ) -> None:
        if not str(url).strip():
            raise ValueError("url cannot be empty")

        self._url = str(url).strip()
        self._policy = (
            policy
            if policy is not None
            else DEFAULT_CACHE_POLICY
        )

        if client is not None:
            self._client = client
        else:
            self._client = self._create_client()

    @property
    def url(self) -> str:
        return self._url

    @property
    def policy(self) -> CachePolicy:
        return self._policy

    @property
    def client(self) -> Any:
        return self._client

    @staticmethod
    def _redis_module() -> Any:
        try:
            import redis
        except ImportError as exc:
            raise RuntimeError(
                "Redis support requires the 'redis' package"
            ) from exc

        return redis

    def _create_client(self) -> Any:
        redis = self._redis_module()

        return redis.Redis.from_url(
            self._url,
            decode_responses=True,
        )

    def ping(self) -> bool:
        """Check Redis connectivity."""
        return bool(self._client.ping())

    def set(
        self,
        key: str,
        value: Any,
        *,
        stream: bool = False,
        success: bool = True,
    ) -> bool:
        """Store a value in Redis according to cache policy."""

        if not self._policy.allows(
            stream=stream,
            success=success,
        ):
            return False

        normalized_key = str(key).strip()

        if not normalized_key:
            raise ValueError("key cannot be empty")

        serialized = serialize_value(value)

        result = self._client.setex(
            normalized_key,
            int(self._policy.ttl_seconds),
            serialized,
        )

        return bool(result)

    def get(
        self,
        key: str,
    ) -> Any | None:
        """Retrieve and deserialize a Redis value."""

        normalized_key = str(key).strip()

        if not normalized_key:
            raise ValueError("key cannot be empty")

        value = self._client.get(normalized_key)

        if value is None:
            return None

        return deserialize_value(value)

    def delete(
        self,
        key: str,
    ) -> bool:
        """Delete a Redis cache entry."""

        normalized_key = str(key).strip()

        if not normalized_key:
            raise ValueError("key cannot be empty")

        return bool(
            self._client.delete(normalized_key)
        )

    def contains(
        self,
        key: str,
    ) -> bool:
        """Check whether a Redis cache key exists."""

        normalized_key = str(key).strip()

        if not normalized_key:
            raise ValueError("key cannot be empty")

        return bool(
            self._client.exists(normalized_key)
        )

    def ttl(
        self,
        key: str,
    ) -> float:
        """Return remaining Redis TTL."""

        normalized_key = str(key).strip()

        if not normalized_key:
            raise ValueError("key cannot be empty")

        value = self._client.ttl(normalized_key)

        if value < 0:
            return 0.0

        return float(value)

    def clear(
        self,
        pattern: str = "modelnow:latency:*",
    ) -> int:
        """Delete cache entries matching a pattern."""

        normalized_pattern = str(pattern).strip()

        if not normalized_pattern:
            raise ValueError("pattern cannot be empty")

        keys = list(
            self._client.scan_iter(
                match=normalized_pattern,
            )
        )

        if not keys:
            return 0

        return int(
            self._client.delete(*keys)
        )


__all__ = [
    "RedisLatencyCache",
]
