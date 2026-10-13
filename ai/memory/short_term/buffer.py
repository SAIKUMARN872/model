from __future__ import annotations

import threading
import uuid
from collections import OrderedDict
from datetime import timedelta
from typing import Any, Mapping

from .memory import ShortTermMemory
from .utils import (
    MAX_BUFFER_ITEMS,
    normalize_timestamp,
    validate_content,
    validate_identifier,
    validate_metadata,
    validate_positive_integer,
)


class ShortTermBuffer:
    def __init__(
        self,
        *,
        max_items: int = 1000,
        default_ttl_seconds: int | None = 1800,
    ) -> None:
        if isinstance(max_items, bool) or not isinstance(max_items, int):
            raise ValueError("max_items must be an integer")
        if not 1 <= max_items <= MAX_BUFFER_ITEMS:
            raise ValueError(f"max_items must be between 1 and {MAX_BUFFER_ITEMS}")
        if default_ttl_seconds is not None:
            validate_positive_integer(default_ttl_seconds, "default_ttl_seconds")

        self._max_items = max_items
        self._default_ttl_seconds = default_ttl_seconds
        self._items: OrderedDict[
            tuple[str, str, str], ShortTermMemory
        ] = OrderedDict()
        self._lock = threading.RLock()
        self._evictions = 0

    @staticmethod
    def _scope(tenant_id: str, user_id: str) -> tuple[str, str]:
        return (
            validate_identifier(tenant_id, "tenant_id"),
            validate_identifier(user_id, "user_id"),
        )

    def _purge_expired_locked(self) -> int:
        now = normalize_timestamp()
        expired = [
            key for key, item in self._items.items() if item.is_expired(now)
        ]
        for key in expired:
            del self._items[key]
        return len(expired)

    def add(
        self,
        tenant_id: str,
        user_id: str,
        content: str,
        *,
        category: str = "conversation",
        memory_id: str | None = None,
        ttl_seconds: int | None = None,
        metadata: Mapping[str, Any] | None = None,
    ) -> ShortTermMemory:
        tenant_id, user_id = self._scope(tenant_id, user_id)
        content = validate_content(content)
        category = validate_identifier(category, "category")

        if ttl_seconds is None:
            ttl_seconds = self._default_ttl_seconds
        else:
            validate_positive_integer(ttl_seconds, "ttl_seconds")

        now = normalize_timestamp()
        expires_at = (
            now + timedelta(seconds=ttl_seconds)
            if ttl_seconds is not None
            else None
        )

        item = ShortTermMemory(
            memory_id=memory_id or str(uuid.uuid4()),
            tenant_id=tenant_id,
            user_id=user_id,
            content=content,
            category=category,
            created_at=now,
            expires_at=expires_at,
            metadata=validate_metadata(metadata),
        )
        key = (tenant_id, user_id, item.memory_id)

        with self._lock:
            self._purge_expired_locked()
            if key in self._items:
                raise ValueError("memory ID already exists in this scope")

            while len(self._items) >= self._max_items:
                self._items.popitem(last=False)
                self._evictions += 1

            self._items[key] = item
            return item

    def get(
        self, tenant_id: str, user_id: str, memory_id: str
    ) -> ShortTermMemory | None:
        tenant_id, user_id = self._scope(tenant_id, user_id)
        memory_id = validate_identifier(memory_id, "memory_id")
        key = (tenant_id, user_id, memory_id)

        with self._lock:
            self._purge_expired_locked()
            item = self._items.get(key)
            if item is not None:
                self._items.move_to_end(key)
            return item

    def search(
        self,
        tenant_id: str,
        user_id: str,
        *,
        query: str | None = None,
        category: str | None = None,
        limit: int = 50,
    ) -> list[ShortTermMemory]:
        tenant_id, user_id = self._scope(tenant_id, user_id)
        if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= 500:
            raise ValueError("limit must be between 1 and 500")

        if query is not None:
            if not isinstance(query, str):
                raise ValueError("query must be a string")
            query = query.casefold().strip()

        if category is not None:
            category = validate_identifier(category, "category")

        with self._lock:
            self._purge_expired_locked()
            results = [
                item
                for key, item in self._items.items()
                if key[:2] == (tenant_id, user_id)
                and (category is None or item.category == category)
                and (query is None or query in item.content.casefold())
            ]
            results.sort(key=lambda item: (item.created_at, item.memory_id), reverse=True)
            return results[:limit]

    def delete(
        self, tenant_id: str, user_id: str, memory_id: str
    ) -> bool:
        tenant_id, user_id = self._scope(tenant_id, user_id)
        memory_id = validate_identifier(memory_id, "memory_id")
        with self._lock:
            return self._items.pop((tenant_id, user_id, memory_id), None) is not None

    def clear(self, tenant_id: str, user_id: str) -> int:
        scope = self._scope(tenant_id, user_id)
        with self._lock:
            keys = [key for key in self._items if key[:2] == scope]
            for key in keys:
                del self._items[key]
            return len(keys)

    def stats(self, tenant_id: str | None = None, user_id: str | None = None) -> dict[str, int]:
        if (tenant_id is None) != (user_id is None):
            raise ValueError("tenant_id and user_id must be supplied together")

        scope = self._scope(tenant_id, user_id) if tenant_id is not None else None
        with self._lock:
            self._purge_expired_locked()
            count = sum(
                1 for key in self._items
                if scope is None or key[:2] == scope
            )
            return {
                "items": count,
                "capacity": self._max_items,
                "evictions": self._evictions,
            }
