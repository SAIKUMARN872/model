"""Bounded, asynchronous in-memory cache for ModelNow RAG."""

from __future__ import annotations

import asyncio
import copy
import time
from collections import OrderedDict
from dataclasses import dataclass
from typing import Any, Protocol, runtime_checkable

from ai.rag.cache.ttl import TTLPolicy


@runtime_checkable
class Cache(Protocol):
    async def get(self, key: str) -> Any | None: ...
    async def set(
        self, key: str, value: Any, ttl_seconds: float | None = None
    ) -> None: ...
    async def delete(self, key: str) -> bool: ...
    async def clear(self) -> None: ...


@dataclass(frozen=True, slots=True)
class CacheStats:
    hits: int
    misses: int
    writes: int
    deletes: int
    evictions: int
    expirations: int
    entries: int


@dataclass(slots=True)
class _Entry:
    value: Any
    expires_at: float


class InMemoryCache:
    """Process-local LRU cache with TTL and bounded entry count.

    Values are deep-copied on writes and reads to prevent callers from
    mutating stored values outside the cache lock.
    """

    def __init__(
        self,
        *,
        max_entries: int = 10000,
        default_ttl_seconds: float = 300.0,
        max_ttl_seconds: float = 604800.0,
    ) -> None:
        if isinstance(max_entries, bool) or not isinstance(max_entries, int):
            raise ValueError("max_entries must be an integer.")
        if max_entries < 1:
            raise ValueError("max_entries must be at least 1.")

        self._max_entries = max_entries
        self._ttl_policy = TTLPolicy(
            default_ttl_seconds=default_ttl_seconds,
            max_ttl_seconds=max_ttl_seconds,
        )
        self._entries: OrderedDict[str, _Entry] = OrderedDict()
        self._lock = asyncio.Lock()
        self._hits = 0
        self._misses = 0
        self._writes = 0
        self._deletes = 0
        self._evictions = 0
        self._expirations = 0

    @staticmethod
    def _validate_key(key: str) -> None:
        if not isinstance(key, str) or not key.strip():
            raise ValueError("Cache key must be a non-empty string.")

    def _remove_expired(self, now: float) -> None:
        expired_keys = [
            key for key, entry in self._entries.items()
            if now >= entry.expires_at
        ]
        for key in expired_keys:
            self._entries.pop(key, None)
            self._expirations += 1

    async def get(self, key: str) -> Any | None:
        self._validate_key(key)

        async with self._lock:
            now = time.monotonic()
            entry = self._entries.get(key)

            if entry is None:
                self._misses += 1
                return None

            if now >= entry.expires_at:
                del self._entries[key]
                self._expirations += 1
                self._misses += 1
                return None

            try:
                result = copy.deepcopy(entry.value)
            except Exception:
                self._misses += 1
                raise

            self._entries.move_to_end(key)
            self._hits += 1
            return result

    async def set(
        self,
        key: str,
        value: Any,
        ttl_seconds: float | None = None,
    ) -> None:
        self._validate_key(key)
        ttl = self._ttl_policy.resolve(ttl_seconds)
        stored_value = copy.deepcopy(value)
        expires_at = time.monotonic() + ttl

        async with self._lock:
            self._remove_expired(time.monotonic())
            self._entries[key] = _Entry(stored_value, expires_at)
            self._entries.move_to_end(key)
            self._writes += 1

            while len(self._entries) > self._max_entries:
                self._entries.popitem(last=False)
                self._evictions += 1

    async def delete(self, key: str) -> bool:
        self._validate_key(key)

        async with self._lock:
            existed = self._entries.pop(key, None) is not None
            if existed:
                self._deletes += 1
            return existed

    async def clear(self) -> None:
        async with self._lock:
            self._entries.clear()

    async def stats(self) -> CacheStats:
        async with self._lock:
            self._remove_expired(time.monotonic())
            return CacheStats(
                hits=self._hits,
                misses=self._misses,
                writes=self._writes,
                deletes=self._deletes,
                evictions=self._evictions,
                expirations=self._expirations,
                entries=len(self._entries),
            )


__all__ = ["Cache", "CacheStats", "InMemoryCache"]
