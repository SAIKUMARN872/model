"""Thread-safe, bounded in-memory embedding cache."""

import threading
import time
from collections import OrderedDict
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class CacheStats:
    hits: int
    misses: int
    writes: int
    evictions: int
    expirations: int
    size: int


class MemoryEmbeddingCache:
    """LRU cache with optional TTL. Values are copied on read and write."""

    def __init__(self, max_entries=10_000, ttl_seconds=3600):
        if (
            not isinstance(max_entries, int)
            or isinstance(max_entries, bool)
            or max_entries < 1
        ):
            raise ValueError("max_entries must be a positive integer")
        if (
            ttl_seconds is not None
            and (
                isinstance(ttl_seconds, bool)
                or not isinstance(ttl_seconds, (int, float))
                or ttl_seconds <= 0
            )
        ):
            raise ValueError("ttl_seconds must be positive or None")

        self.max_entries = max_entries
        self.ttl_seconds = ttl_seconds
        self._entries = OrderedDict()
        self._lock = threading.RLock()
        self._hits = self._misses = self._writes = 0
        self._evictions = self._expirations = 0

    @staticmethod
    def _copy(value):
        if isinstance(value, list):
            return [MemoryEmbeddingCache._copy(item) for item in value]
        if isinstance(value, dict):
            return {key: MemoryEmbeddingCache._copy(item) for key, item in value.items()}
        if isinstance(value, tuple):
            return tuple(MemoryEmbeddingCache._copy(item) for item in value)
        return value

    def get(self, key):
        now = time.monotonic()
        with self._lock:
            entry = self._entries.get(key)
            if entry is None:
                self._misses += 1
                return None

            value, expires_at = entry
            if expires_at is not None and now >= expires_at:
                del self._entries[key]
                self._expirations += 1
                self._misses += 1
                return None

            self._entries.move_to_end(key)
            self._hits += 1
            return self._copy(value)

    def set(self, key, value, ttl_seconds=None):
        if not isinstance(key, str) or not key:
            raise ValueError("Cache key must be a non-empty string")

        ttl = self.ttl_seconds if ttl_seconds is None else ttl_seconds
        if ttl is not None and (
            isinstance(ttl, bool)
            or not isinstance(ttl, (int, float))
            or ttl <= 0
        ):
            raise ValueError("TTL must be positive or None")

        expires_at = None if ttl is None else time.monotonic() + ttl
        copied = self._copy(value)

        with self._lock:
            self._entries[key] = (copied, expires_at)
            self._entries.move_to_end(key)
            self._writes += 1

            while len(self._entries) > self.max_entries:
                self._entries.popitem(last=False)
                self._evictions += 1

    def delete(self, key):
        with self._lock:
            return self._entries.pop(key, None) is not None

    def clear(self):
        with self._lock:
            self._entries.clear()

    def stats(self):
        with self._lock:
            return CacheStats(
                hits=self._hits,
                misses=self._misses,
                writes=self._writes,
                evictions=self._evictions,
                expirations=self._expirations,
                size=len(self._entries),
            )

    def close(self):
        self.clear()
