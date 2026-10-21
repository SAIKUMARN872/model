from __future__ import annotations

from dataclasses import dataclass
from threading import Lock
from time import monotonic
from typing import Any


@dataclass(frozen=True)
class CacheEntry:
    key: str
    value: Any
    expires_at: float


class ModelMemoryCache:
    """Thread-safe TTL cache for model-memory lookups."""

    def __init__(self, max_entries: int = 1_000, ttl_seconds: float = 300.0) -> None:
        if max_entries <= 0:
            raise ValueError("max_entries must be greater than zero")

        if ttl_seconds <= 0:
            raise ValueError("ttl_seconds must be greater than zero")

        self._max_entries = int(max_entries)
        self._ttl_seconds = float(ttl_seconds)
        self._entries: dict[str, CacheEntry] = {}
        self._lock = Lock()

    @property
    def max_entries(self) -> int:
        return self._max_entries

    @property
    def ttl_seconds(self) -> float:
        return self._ttl_seconds

    def set(
        self,
        key: str,
        value: Any,
        ttl_seconds: float | None = None,
    ) -> None:
        normalized_key = str(key).strip()

        if not normalized_key:
            raise ValueError("cache key cannot be empty")

        ttl = (
            self._ttl_seconds
            if ttl_seconds is None
            else float(ttl_seconds)
        )

        if ttl <= 0:
            raise ValueError("ttl_seconds must be greater than zero")

        entry = CacheEntry(
            key=normalized_key,
            value=value,
            expires_at=monotonic() + ttl,
        )

        with self._lock:
            self._remove_expired_locked()

            if normalized_key not in self._entries:
                while len(self._entries) >= self._max_entries:
                    oldest_key = next(iter(self._entries))
                    del self._entries[oldest_key]

            self._entries[normalized_key] = entry

    def get(self, key: str) -> Any | None:
        normalized_key = str(key).strip()

        if not normalized_key:
            return None

        with self._lock:
            entry = self._entries.get(normalized_key)

            if entry is None:
                return None

            if entry.expires_at <= monotonic():
                del self._entries[normalized_key]
                return None

            return entry.value

    def contains(self, key: str) -> bool:
        return self.get(key) is not None

    def remove(self, key: str) -> bool:
        normalized_key = str(key).strip()

        with self._lock:
            if normalized_key not in self._entries:
                return False

            del self._entries[normalized_key]
            return True

    def clear(self) -> int:
        with self._lock:
            count = len(self._entries)
            self._entries.clear()
            return count

    def size(self) -> int:
        with self._lock:
            self._remove_expired_locked()
            return len(self._entries)

    def _remove_expired_locked(self) -> int:
        now = monotonic()

        expired_keys = [
            key
            for key, entry in self._entries.items()
            if entry.expires_at <= now
        ]

        for key in expired_keys:
            del self._entries[key]

        return len(expired_keys)


__all__ = [
    "CacheEntry",
    "ModelMemoryCache",
]
