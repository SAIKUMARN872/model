"""Thread-safe, bounded in-process cache for ModelNow memory."""

from __future__ import annotations

import copy
import threading
import time
from collections import OrderedDict
from dataclasses import dataclass
from typing import Any

from ..constants import DEFAULT_CACHE_TTL_SECONDS
from ..exceptions import MemoryValidationError
from ..utils import validate_identifier
from .ttl import normalize_ttl
from .utils import validate_bounded_identifier


@dataclass(frozen=True, slots=True)
class _CacheEntry:
    value: Any
    expires_at: float | None


class TTLMemoryCache:
    """Thread-safe TTL cache with bounded LRU eviction and defensive copies.

    This cache is process-local. Use RedisMemoryCache when entries must be
    shared across application workers or machines.
    """

    def __init__(
        self,
        *,
        max_entries: int = 10_000,
        default_ttl_seconds: float | None = DEFAULT_CACHE_TTL_SECONDS,
        clock=time.monotonic,
    ) -> None:
        if isinstance(max_entries, bool) or not isinstance(max_entries, int) or max_entries < 1:
            raise MemoryValidationError("max_entries must be a positive integer")
        if not callable(clock):
            raise MemoryValidationError("clock must be callable")

        self.max_entries = max_entries
        self.default_ttl_seconds = normalize_ttl(default_ttl_seconds)
        self._clock = clock
        self._entries: OrderedDict[str, _CacheEntry] = OrderedDict()
        self._lock = threading.RLock()
        self._hits = 0
        self._misses = 0
        self._evictions = 0
        self._expirations = 0

    @staticmethod
    def _key(key: str) -> str:
        return validate_bounded_identifier(key, field="cache_key", max_length=512)

    def _remove_expired(self, now: float) -> None:
        expired = [
            key for key, entry in self._entries.items()
            if entry.expires_at is not None and entry.expires_at <= now
        ]
        for key in expired:
            self._entries.pop(key, None)
        self._expirations += len(expired)

    def get(self, key: str) -> Any | None:
        key = self._key(key)
        with self._lock:
            now = self._clock()
            entry = self._entries.get(key)
            if entry is None:
                self._misses += 1
                return None

            if entry.expires_at is not None and entry.expires_at <= now:
                self._entries.pop(key, None)
                self._expirations += 1
                self._misses += 1
                return None

            self._entries.move_to_end(key)
            self._hits += 1
            return copy.deepcopy(entry.value)

    def set(
        self,
        key: str,
        value: Any,
        ttl_seconds: float | None = None,
    ) -> None:
        key = self._key(key)
        ttl = self.default_ttl_seconds if ttl_seconds is None else normalize_ttl(ttl_seconds)

        # Copy before acquiring the lock; fail early if the value is not copyable.
        stored_value = copy.deepcopy(value)
        expires_at = None if ttl is None else self._clock() + ttl

        with self._lock:
            self._remove_expired(self._clock())

            # A TTL of zero means do not retain the value.
            if ttl == 0:
                self._entries.pop(key, None)
                return

            self._entries[key] = _CacheEntry(stored_value, expires_at)
            self._entries.move_to_end(key)

            while len(self._entries) > self.max_entries:
                self._entries.popitem(last=False)
                self._evictions += 1

    def delete(self, key: str) -> bool:
        key = self._key(key)
        with self._lock:
            return self._entries.pop(key, None) is not None

    def clear(self) -> None:
        with self._lock:
            self._entries.clear()

    def purge_expired(self) -> int:
        """Remove expired entries and return the number removed."""
        with self._lock:
            before = len(self._entries)
            self._remove_expired(self._clock())
            return before - len(self._entries)

    def stats(self) -> dict[str, int]:
        with self._lock:
            self._remove_expired(self._clock())
            return {
                "entries": len(self._entries),
                "max_entries": self.max_entries,
                "hits": self._hits,
                "misses": self._misses,
                "evictions": self._evictions,
                "expirations": self._expirations,
            }


MemoryCache = TTLMemoryCache

