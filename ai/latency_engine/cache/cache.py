from __future__ import annotations

from dataclasses import dataclass, field
from threading import Lock
from time import time
from typing import Any

from .cache_policy import (
    CachePolicy,
    DEFAULT_CACHE_POLICY,
)
from .utils import (
    is_expired,
    remaining_ttl,
)


@dataclass(frozen=True)
class CacheEntry:
    """A single cached inference result."""

    key: str
    value: Any
    created_at: float = field(default_factory=time)
    metadata: dict[str, Any] = field(default_factory=dict)


class LatencyCache:
    """Thread-safe in-memory cache for latency-sensitive inference."""

    def __init__(
        self,
        policy: CachePolicy | None = None,
    ) -> None:
        self._policy = (
            policy
            if policy is not None
            else DEFAULT_CACHE_POLICY
        )

        self._entries: dict[str, CacheEntry] = {}
        self._lock = Lock()

        self._hits = 0
        self._misses = 0

    @property
    def policy(self) -> CachePolicy:
        return self._policy

    @property
    def hits(self) -> int:
        with self._lock:
            return self._hits

    @property
    def misses(self) -> int:
        with self._lock:
            return self._misses

    @property
    def size(self) -> int:
        with self._lock:
            return len(self._entries)

    def set(
        self,
        key: str,
        value: Any,
        *,
        metadata: dict[str, Any] | None = None,
        stream: bool = False,
        success: bool = True,
    ) -> bool:
        """Store a value if the configured policy permits caching."""

        if not self._policy.allows(
            stream=stream,
            success=success,
        ):
            return False

        normalized_key = str(key).strip()

        if not normalized_key:
            raise ValueError("key cannot be empty")

        entry = CacheEntry(
            key=normalized_key,
            value=value,
            metadata=dict(metadata or {}),
        )

        with self._lock:
            if (
                normalized_key not in self._entries
                and len(self._entries) >= self._policy.max_entries
            ):
                oldest_key = min(
                    self._entries,
                    key=lambda item: self._entries[item].created_at,
                )
                del self._entries[oldest_key]

            self._entries[normalized_key] = entry

        return True

    def get(
        self,
        key: str,
    ) -> Any | None:
        """Retrieve a cached value, respecting TTL."""

        normalized_key = str(key).strip()

        if not normalized_key:
            raise ValueError("key cannot be empty")

        with self._lock:
            entry = self._entries.get(normalized_key)

            if entry is None:
                self._misses += 1
                return None

            if is_expired(
                entry.created_at,
                self._policy.ttl_seconds,
            ):
                del self._entries[normalized_key]
                self._misses += 1
                return None

            self._hits += 1
            return entry.value

    def get_entry(
        self,
        key: str,
    ) -> CacheEntry | None:
        """Retrieve the complete cache entry."""

        normalized_key = str(key).strip()

        if not normalized_key:
            raise ValueError("key cannot be empty")

        with self._lock:
            entry = self._entries.get(normalized_key)

            if entry is None:
                self._misses += 1
                return None

            if is_expired(
                entry.created_at,
                self._policy.ttl_seconds,
            ):
                del self._entries[normalized_key]
                self._misses += 1
                return None

            self._hits += 1
            return entry

    def delete(
        self,
        key: str,
    ) -> bool:
        """Delete a cache entry."""

        normalized_key = str(key).strip()

        if not normalized_key:
            raise ValueError("key cannot be empty")

        with self._lock:
            if normalized_key not in self._entries:
                return False

            del self._entries[normalized_key]
            return True

    def contains(
        self,
        key: str,
    ) -> bool:
        """Check whether an unexpired key exists."""

        normalized_key = str(key).strip()

        if not normalized_key:
            raise ValueError("key cannot be empty")

        with self._lock:
            entry = self._entries.get(normalized_key)

            if entry is None:
                return False

            if is_expired(
                entry.created_at,
                self._policy.ttl_seconds,
            ):
                del self._entries[normalized_key]
                return False

            return True

    def ttl(
        self,
        key: str,
    ) -> float:
        """Return remaining TTL for a cache entry."""

        normalized_key = str(key).strip()

        if not normalized_key:
            raise ValueError("key cannot be empty")

        with self._lock:
            entry = self._entries.get(normalized_key)

            if entry is None:
                return 0.0

            remaining = remaining_ttl(
                entry.created_at,
                self._policy.ttl_seconds,
            )

            if remaining <= 0.0:
                del self._entries[normalized_key]
                return 0.0

            return remaining

    def clear(self) -> int:
        """Clear all cached entries."""

        with self._lock:
            count = len(self._entries)
            self._entries.clear()
            return count

    def reset_metrics(self) -> None:
        """Reset cache hit/miss counters."""

        with self._lock:
            self._hits = 0
            self._misses = 0


__all__ = [
    "CacheEntry",
    "LatencyCache",
]
