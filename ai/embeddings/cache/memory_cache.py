"""
Thread-safe in-memory cache for ModelNow.
"""

from __future__ import annotations

from collections import OrderedDict
from dataclasses import dataclass
from threading import RLock
from typing import Any

from .utils import (
    calculate_expiry,
    current_time,
    estimate_size,
    is_expired,
    normalize_ttl,
)


@dataclass
class MemoryCacheEntry:
    """
    Represents one in-memory cache entry.
    """

    value: Any

    expires_at: float | None = None

    created_at: float = 0.0

    last_accessed: float = 0.0

    access_count: int = 0

    size_bytes: int = 0

    def __post_init__(self) -> None:

        now = current_time()

        if self.created_at == 0:

            self.created_at = now

        if self.last_accessed == 0:

            self.last_accessed = now

        if self.size_bytes == 0:

            self.size_bytes = estimate_size(
                self.value
            )

    @property
    def expired(self) -> bool:

        return is_expired(
            self.expires_at
        )

    def touch(self) -> None:

        self.last_accessed = current_time()

        self.access_count += 1


@dataclass
class MemoryCacheStats:
    """
    Statistics for the memory cache.
    """

    hits: int = 0

    misses: int = 0

    sets: int = 0

    deletes: int = 0

    evictions: int = 0

    expirations: int = 0

    @property
    def hit_rate(self) -> float:

        total = (
            self.hits
            + self.misses
        )

        if total == 0:
            return 0.0

        return (
            self.hits / total
        ) * 100.0

    def to_dict(self) -> dict[str, Any]:

        return {
            "hits": self.hits,
            "misses": self.misses,
            "sets": self.sets,
            "deletes": self.deletes,
            "evictions": self.evictions,
            "expirations": self.expirations,
            "hit_rate": self.hit_rate,
        }


class MemoryCache:
    """
    Thread-safe LRU-style in-memory cache.

    Features:
        - TTL
        - LRU eviction
        - maximum item count
        - maximum memory size
        - statistics
        - thread safety
    """

    def __init__(
        self,
        max_size: int = 1000,
        max_memory_bytes: int | None = None,
    ) -> None:

        if max_size <= 0:

            raise ValueError(
                "max_size must be greater than zero"
            )

        if (
            max_memory_bytes is not None
            and max_memory_bytes <= 0
        ):

            raise ValueError(
                "max_memory_bytes must be greater than zero"
            )

        self.max_size = max_size

        self.max_memory_bytes = (
            max_memory_bytes
        )

        self._entries: OrderedDict[
            str,
            MemoryCacheEntry,
        ] = OrderedDict()

        self._memory_bytes = 0

        self._stats = MemoryCacheStats()

        self._lock = RLock()

    # --------------------------------------------------
    # Basic operations
    # --------------------------------------------------

    def get(
        self,
        key: str,
        default: Any = None,
    ) -> Any:

        with self._lock:

            entry = self._entries.get(
                key
            )

            if entry is None:

                self._stats.misses += 1

                return default

            if entry.expired:

                self._remove_entry(
                    key
                )

                self._stats.misses += 1

                self._stats.expirations += 1

                return default

            entry.touch()

            self._entries.move_to_end(
                key
            )

            self._stats.hits += 1

            return entry.value

    def set(
        self,
        key: str,
        value: Any,
        ttl: float | None = None,
    ) -> bool:

        ttl = normalize_ttl(
            ttl
        )

        with self._lock:

            if key in self._entries:

                self._remove_entry(
                    key
                )

            entry = MemoryCacheEntry(
                value=value,
                expires_at=calculate_expiry(
                    ttl
                ),
            )

            self._entries[
                key
            ] = entry

            self._memory_bytes += (
                entry.size_bytes
            )

            self._stats.sets += 1

            self._evict_if_needed()

            return True

    def delete(
        self,
        key: str,
    ) -> bool:

        with self._lock:

            if key not in self._entries:

                return False

            self._remove_entry(
                key
            )

            self._stats.deletes += 1

            return True

    def exists(
        self,
        key: str,
    ) -> bool:

        with self._lock:

            entry = self._entries.get(
                key
            )

            if entry is None:
                return False

            if entry.expired:

                self._remove_entry(
                    key
                )

                self._stats.expirations += 1

                return False

            return True

    # --------------------------------------------------
    # Bulk operations
    # --------------------------------------------------

    def get_many(
        self,
        keys: list[str],
    ) -> dict[str, Any]:

        result = {}

        for key in keys:

            value = self.get(
                key,
                default=None,
            )

            if value is not None:

                result[key] = value

        return result

    def set_many(
        self,
        values: dict[str, Any],
        ttl: float | None = None,
    ) -> None:

        for key, value in values.items():

            self.set(
                key,
                value,
                ttl=ttl,
            )

    def delete_many(
        self,
        keys: list[str],
    ) -> int:

        deleted = 0

        for key in keys:

            if self.delete(key):

                deleted += 1

        return deleted

    # --------------------------------------------------
    # Maintenance
    # --------------------------------------------------

    def clear(self) -> None:

        with self._lock:

            self._entries.clear()

            self._memory_bytes = 0

    def cleanup_expired(self) -> int:

        removed = 0

        with self._lock:

            keys = list(
                self._entries.keys()
            )

            for key in keys:

                entry = self._entries.get(
                    key
                )

                if (
                    entry is not None
                    and entry.expired
                ):

                    self._remove_entry(
                        key
                    )

                    self._stats.expirations += 1

                    removed += 1

        return removed

    def keys(self) -> list[str]:

        with self._lock:

            self.cleanup_expired()

            return list(
                self._entries.keys()
            )

    def values(self) -> list[Any]:

        with self._lock:

            self.cleanup_expired()

            return [
                entry.value
                for entry
                in self._entries.values()
            ]

    def items(
        self,
    ) -> list[tuple[str, Any]]:

        with self._lock:

            self.cleanup_expired()

            return [
                (
                    key,
                    entry.value,
                )
                for key, entry
                in self._entries.items()
            ]

    # --------------------------------------------------
    # Eviction
    # --------------------------------------------------

    def _evict_if_needed(self) -> None:

        while (
            len(self._entries)
            > self.max_size
        ):

            key, _ = (
                self._entries.popitem(
                    last=False
                )
            )

            # Recalculate memory safely.
            # The entry has already been removed.
            self._recalculate_memory()

            self._stats.evictions += 1

        if (
            self.max_memory_bytes is not None
        ):

            while (
                self._memory_bytes
                > self.max_memory_bytes
                and self._entries
            ):

                self._entries.popitem(
                    last=False
                )

                self._recalculate_memory()

                self._stats.evictions += 1

    def _remove_entry(
        self,
        key: str,
    ) -> None:

        entry = self._entries.pop(
            key,
            None,
        )

        if entry is not None:

            self._memory_bytes -= (
                entry.size_bytes
            )

            if self._memory_bytes < 0:

                self._memory_bytes = 0

    def _recalculate_memory(self) -> None:

        self._memory_bytes = sum(
            entry.size_bytes
            for entry
            in self._entries.values()
        )

    # --------------------------------------------------
    # Information
    # --------------------------------------------------

    def size(self) -> int:

        with self._lock:

            self.cleanup_expired()

            return len(
                self._entries
            )

    def memory_usage(self) -> int:

        with self._lock:

            return self._memory_bytes

    def stats(self) -> dict[str, Any]:

        with self._lock:

            data = self._stats.to_dict()

            data.update(
                {
                    "size": self.size(),
                    "max_size": self.max_size,
                    "memory_bytes": (
                        self._memory_bytes
                    ),
                    "max_memory_bytes": (
                        self.max_memory_bytes
                    ),
                }
            )

            return data