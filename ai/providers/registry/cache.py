cd "C:\Users\pamar\Downloads\model-main\model-main"

@'
from __future__ import annotations

import time
from dataclasses import dataclass
from threading import RLock
from typing import Any, Dict, Optional


@dataclass
class CacheEntry:
    value: Any
    expires_at: Optional[float] = None


class RegistryCache:
    """
    Thread-safe TTL cache used by ModelNow registry infrastructure.

    The cache is intentionally independent from the model/provider
    registries so it can later be replaced with Redis or another
    distributed cache without changing registry APIs.
    """

    def __init__(
        self,
        default_ttl_seconds: int = 300,
        max_entries: int = 10_000,
    ) -> None:
        if default_ttl_seconds < 0:
            raise ValueError(
                "default_ttl_seconds must be >= 0"
            )

        if max_entries <= 0:
            raise ValueError(
                "max_entries must be > 0"
            )

        self.default_ttl_seconds = default_ttl_seconds
        self.max_entries = max_entries

        self._entries: Dict[str, CacheEntry] = {}
        self._lock = RLock()

        self._hits = 0
        self._misses = 0

    # ------------------------------------------------------------------
    # Core operations
    # ------------------------------------------------------------------

    def set(
        self,
        key: str,
        value: Any,
        ttl_seconds: Optional[int] = None,
    ) -> None:

        if not key:
            raise ValueError("Cache key cannot be empty.")

        ttl = (
            self.default_ttl_seconds
            if ttl_seconds is None
            else ttl_seconds
        )

        if ttl < 0:
            raise ValueError(
                "ttl_seconds must be >= 0"
            )

        expires_at = (
            None
            if ttl == 0
            else time.monotonic() + ttl
        )

        with self._lock:

            if (
                key not in self._entries
                and len(self._entries) >= self.max_entries
            ):
                self._evict_one()

            self._entries[key] = CacheEntry(
                value=value,
                expires_at=expires_at,
            )

    def get(
        self,
        key: str,
        default: Any = None,
    ) -> Any:

        with self._lock:

            entry = self._entries.get(key)

            if entry is None:
                self._misses += 1
                return default

            if self._expired(entry):
                del self._entries[key]
                self._misses += 1
                return default

            self._hits += 1
            return entry.value

    def exists(
        self,
        key: str,
    ) -> bool:

        sentinel = object()

        return (
            self.get(
                key,
                sentinel,
            )
            is not sentinel
        )

    def delete(
        self,
        key: str,
    ) -> None:

        with self._lock:
            self._entries.pop(key, None)

    def clear(self) -> None:

        with self._lock:
            self._entries.clear()

    # ------------------------------------------------------------------
    # Expiration
    # ------------------------------------------------------------------

    @staticmethod
    def _expired(
        entry: CacheEntry,
    ) -> bool:

        if entry.expires_at is None:
            return False

        return time.monotonic() >= entry.expires_at

    def cleanup(self) -> int:
        """
        Remove expired entries.

        Returns number of removed entries.
        """

        removed = 0

        with self._lock:

            expired_keys = [
                key
                for key, entry in self._entries.items()
                if self._expired(entry)
            ]

            for key in expired_keys:
                del self._entries[key]
                removed += 1

        return removed

    # ------------------------------------------------------------------
    # Eviction
    # ------------------------------------------------------------------

    def _evict_one(self) -> None:
        """
        Simple deterministic eviction strategy.

        This can later be replaced with LRU/LFU when the registry
        becomes distributed.
        """

        if not self._entries:
            return

        key = next(iter(self._entries))
        del self._entries[key]

    # ------------------------------------------------------------------
    # Diagnostics
    # ------------------------------------------------------------------

    @property
    def size(self) -> int:

        with self._lock:
            return len(self._entries)

    @property
    def hits(self) -> int:
        return self._hits

    @property
    def misses(self) -> int:
        return self._misses

    @property
    def hit_rate(self) -> float:

        total = self._hits + self._misses

        if total == 0:
            return 0.0

        return self._hits / total

    def stats(self) -> Dict[str, Any]:

        return {
            "size": self.size,
            "max_entries": self.max_entries,
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": self.hit_rate,
        }
'@ | Set-Content ".\ai\providers\registry\cache.py" -Encoding UTF8