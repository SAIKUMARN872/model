from __future__ import annotations

from collections import OrderedDict
from dataclasses import dataclass
from threading import RLock
import time
from typing import Any

from .utils import (
    calculate_hit_rate,
    calculate_savings,
    is_expired,
    make_cache_key,
    validate_key,
)


@dataclass(frozen=True)
class CacheEntry:
    key: str
    value: Any
    created_at: float
    expires_at: float | None
    model: str | None = None
    provider: str | None = None
    metadata: dict[str, Any] | None = None

    @property
    def expired(self) -> bool:
        if self.expires_at is None:
            return False

        return time.time() >= self.expires_at

    def as_dict(self) -> dict[str, Any]:
        return {
            "key": self.key,
            "value": self.value,
            "created_at": self.created_at,
            "expires_at": self.expires_at,
            "model": self.model,
            "provider": self.provider,
            "metadata": dict(self.metadata or {}),
        }


@dataclass(frozen=True)
class CacheStatistics:
    entries: int
    hits: int
    misses: int
    evictions: int
    expirations: int
    hit_rate: Any
    estimated_savings: Any

    def as_dict(self) -> dict[str, Any]:
        return {
            "entries": self.entries,
            "hits": self.hits,
            "misses": self.misses,
            "evictions": self.evictions,
            "expirations": self.expirations,
            "hit_rate": str(self.hit_rate),
            "estimated_savings": str(
                self.estimated_savings
            ),
        }


class CacheManager:
    def __init__(
        self,
        max_entries: int = 1000,
        default_ttl_seconds: float | int = 3600,
        average_request_cost: float | int | str = 0,
    ) -> None:
        if max_entries <= 0:
            raise ValueError(
                "max_entries must be greater than zero"
            )

        if default_ttl_seconds < 0:
            raise ValueError(
                "default_ttl_seconds cannot be negative"
            )

        if float(average_request_cost) < 0:
            raise ValueError(
                "average_request_cost cannot be negative"
            )

        self.max_entries = max_entries
        self.default_ttl_seconds = default_ttl_seconds
        self.average_request_cost = average_request_cost

        self._entries: OrderedDict[
            str,
            CacheEntry,
        ] = OrderedDict()

        self._hits = 0
        self._misses = 0
        self._evictions = 0
        self._expirations = 0

        self._lock = RLock()

    def set(
        self,
        key: str,
        value: Any,
        ttl_seconds: float | int | None = None,
        model: str | None = None,
        provider: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> CacheEntry:
        normalized_key = validate_key(key)

        ttl = (
            self.default_ttl_seconds
            if ttl_seconds is None
            else ttl_seconds
        )

        if ttl < 0:
            raise ValueError(
                "ttl_seconds cannot be negative"
            )

        now = time.time()

        expires_at = (
            None
            if ttl == 0
            else now + float(ttl)
        )

        entry = CacheEntry(
            key=normalized_key,
            value=value,
            created_at=now,
            expires_at=expires_at,
            model=model,
            provider=provider,
            metadata=dict(metadata or {}),
        )

        with self._lock:
            self._entries.pop(
                normalized_key,
                None,
            )

            self._entries[
                normalized_key
            ] = entry

            self._evict_if_needed()

        return entry

    def set_for_request(
        self,
        request: Any,
        value: Any,
        namespace: str = "modelnow",
        ttl_seconds: float | int | None = None,
        model: str | None = None,
        provider: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> CacheEntry:
        key = make_cache_key(
            request,
            namespace=namespace,
        )

        return self.set(
            key=key,
            value=value,
            ttl_seconds=ttl_seconds,
            model=model,
            provider=provider,
            metadata=metadata,
        )

    def get(
        self,
        key: str,
        default: Any = None,
    ) -> Any:
        normalized_key = validate_key(key)

        with self._lock:
            entry = self._entries.get(
                normalized_key
            )

            if entry is None:
                self._misses += 1
                return default

            if entry.expired:
                self._entries.pop(
                    normalized_key,
                    None,
                )

                self._expirations += 1
                self._misses += 1

                return default

            self._entries.move_to_end(
                normalized_key
            )

            self._hits += 1

            return entry.value

    def get_entry(
        self,
        key: str,
    ) -> CacheEntry | None:
        normalized_key = validate_key(key)

        with self._lock:
            entry = self._entries.get(
                normalized_key
            )

            if entry is None:
                self._misses += 1
                return None

            if entry.expired:
                self._entries.pop(
                    normalized_key,
                    None,
                )

                self._expirations += 1
                self._misses += 1

                return None

            self._entries.move_to_end(
                normalized_key
            )

            self._hits += 1

            return entry

    def get_for_request(
        self,
        request: Any,
        namespace: str = "modelnow",
        default: Any = None,
    ) -> Any:
        key = make_cache_key(
            request,
            namespace=namespace,
        )

        return self.get(
            key,
            default=default,
        )

    def contains(
        self,
        key: str,
    ) -> bool:
        normalized_key = validate_key(key)

        with self._lock:
            entry = self._entries.get(
                normalized_key
            )

            if entry is None:
                return False

            if entry.expired:
                self._entries.pop(
                    normalized_key,
                    None,
                )

                self._expirations += 1

                return False

            return True

    def delete(
        self,
        key: str,
    ) -> bool:
        normalized_key = validate_key(key)

        with self._lock:
            return (
                self._entries.pop(
                    normalized_key,
                    None,
                )
                is not None
            )

    def invalidate(
        self,
        key: str,
    ) -> bool:
        return self.delete(key)

    def clear(self) -> None:
        with self._lock:
            self._entries.clear()

    def clear_statistics(self) -> None:
        with self._lock:
            self._hits = 0
            self._misses = 0
            self._evictions = 0
            self._expirations = 0

    def purge_expired(self) -> int:
        removed = 0

        with self._lock:
            expired_keys = [
                key
                for key, entry in self._entries.items()
                if entry.expired
            ]

            for key in expired_keys:
                self._entries.pop(
                    key,
                    None,
                )

                self._expirations += 1
                removed += 1

        return removed

    def keys(self) -> list[str]:
        with self._lock:
            self.purge_expired()

            return list(self._entries.keys())

    def entries(self) -> list[CacheEntry]:
        with self._lock:
            self.purge_expired()

            return list(self._entries.values())

    def statistics(self) -> CacheStatistics:
        with self._lock:
            hit_rate = calculate_hit_rate(
                self._hits,
                self._misses,
            )

            savings = calculate_savings(
                self._hits,
                self.average_request_cost,
            )

            return CacheStatistics(
                entries=len(self._entries),
                hits=self._hits,
                misses=self._misses,
                evictions=self._evictions,
                expirations=self._expirations,
                hit_rate=hit_rate,
                estimated_savings=savings,
            )

    def size(self) -> int:
        with self._lock:
            self.purge_expired()

            return len(self._entries)

    def _evict_if_needed(self) -> None:
        while len(self._entries) > self.max_entries:
            self._entries.popitem(
                last=False
            )

            self._evictions += 1


def create_cache_manager(
    max_entries: int = 1000,
    default_ttl_seconds: float | int = 3600,
    average_request_cost: float | int | str = 0,
) -> CacheManager:
    return CacheManager(
        max_entries=max_entries,
        default_ttl_seconds=default_ttl_seconds,
        average_request_cost=average_request_cost,
    )


__all__ = [
    "CacheEntry",
    "CacheStatistics",
    "CacheManager",
    "create_cache_manager",
]
