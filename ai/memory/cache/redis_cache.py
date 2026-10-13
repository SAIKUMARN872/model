"""Optional Redis-backed cache adapter for ModelNow memory.

Pass an existing Redis-compatible client or a URL. Importing this module does
not require Redis to be installed and does not establish a network connection.
Values must be JSON-serializable.
"""

from __future__ import annotations

import json
from typing import Any

from ..constants import DEFAULT_CACHE_TTL_SECONDS
from ..exceptions import (
    MemoryBackendUnavailableError,
    MemorySerializationError,
    MemoryValidationError,
)
from .utils import validate_bounded_identifier
from .ttl import normalize_ttl


class RedisMemoryCache:
    """Redis cache with explicit JSON serialization and namespaced keys."""

    def __init__(
        self,
        client: Any | None = None,
        *,
        url: str | None = None,
        prefix: str = "modelnow:memory",
        default_ttl_seconds: float | None = DEFAULT_CACHE_TTL_SECONDS,
    ) -> None:
        if client is not None and url is not None:
            raise MemoryValidationError("Pass either client or url, not both")
        if client is None and not url:
            raise MemoryValidationError("A Redis client or URL is required")

        self.prefix = validate_bounded_identifier(prefix, field="prefix", max_length=128)
        self.default_ttl_seconds = normalize_ttl(default_ttl_seconds)

        if client is None:
            try:
                import redis
            except ImportError as exc:
                raise MemoryBackendUnavailableError(
                    "Redis support requires the optional 'redis' package"
                ) from exc
            client = redis.Redis.from_url(url, decode_responses=True)

        self._client = client

    def _key(self, key: str) -> str:
        key = validate_bounded_identifier(key, field="cache_key", max_length=512)
        return f"{self.prefix}:{key}"

    def get(self, key: str) -> Any | None:
        try:
            value = self._client.get(self._key(key))
        except Exception as exc:
            raise MemoryBackendUnavailableError("Redis cache read failed") from exc

        if value is None:
            return None
        if isinstance(value, bytes):
            value = value.decode("utf-8")
        try:
            return json.loads(value)
        except (UnicodeDecodeError, json.JSONDecodeError, TypeError) as exc:
            raise MemorySerializationError("Redis cache contains invalid JSON") from exc

    def set(
        self,
        key: str,
        value: Any,
        ttl_seconds: float | None = None,
    ) -> None:
        ttl = self.default_ttl_seconds if ttl_seconds is None else normalize_ttl(ttl_seconds)
        redis_key = self._key(key)

        try:
            encoded = json.dumps(
                value,
                ensure_ascii=False,
                allow_nan=False,
                separators=(",", ":"),
            )
        except (TypeError, ValueError) as exc:
            raise MemorySerializationError(
                "Cache value must be valid JSON data"
            ) from exc

        try:
            if ttl == 0:
                self._client.delete(redis_key)
            elif ttl is None:
                self._client.set(redis_key, encoded)
            else:
                # Redis SET EX uses integer seconds; use PX for fractional TTL.
                milliseconds = max(1, int(ttl * 1000))
                self._client.set(redis_key, encoded, px=milliseconds)
        except Exception as exc:
            raise MemoryBackendUnavailableError("Redis cache write failed") from exc

    def delete(self, key: str) -> bool:
        try:
            return bool(self._client.delete(self._key(key)))
        except Exception as exc:
            raise MemoryBackendUnavailableError("Redis cache delete failed") from exc

    def clear(self) -> None:
        """Delete keys belonging to this prefix without flushing the whole Redis DB."""
        pattern = f"{self.prefix}:*"
        try:
            batch: list[str] = []
            for key in self._client.scan_iter(match=pattern, count=500):
                batch.append(key)
                if len(batch) >= 500:
                    self._client.delete(*batch)
                    batch.clear()
            if batch:
                self._client.delete(*batch)
        except Exception as exc:
            raise MemoryBackendUnavailableError("Redis cache clear failed") from exc

