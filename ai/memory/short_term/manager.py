from __future__ import annotations

from typing import Any, Mapping

from .buffer import ShortTermBuffer
from .memory import ShortTermMemory


class ShortTermMemoryManager:
    def __init__(
        self,
        *,
        max_items: int = 1000,
        default_ttl_seconds: int | None = 1800,
    ) -> None:
        self.buffer = ShortTermBuffer(
            max_items=max_items,
            default_ttl_seconds=default_ttl_seconds,
        )

    def remember(
        self,
        tenant_id: str,
        user_id: str,
        content: str,
        *,
        category: str = "conversation",
        ttl_seconds: int | None = None,
        metadata: Mapping[str, Any] | None = None,
    ) -> ShortTermMemory:
        return self.buffer.add(
            tenant_id,
            user_id,
            content,
            category=category,
            ttl_seconds=ttl_seconds,
            metadata=metadata,
        )

    def recall(
        self,
        tenant_id: str,
        user_id: str,
        *,
        query: str | None = None,
        category: str | None = None,
        limit: int = 50,
    ) -> list[ShortTermMemory]:
        return self.buffer.search(
            tenant_id,
            user_id,
            query=query,
            category=category,
            limit=limit,
        )

    def forget(
        self, tenant_id: str, user_id: str, memory_id: str
    ) -> bool:
        return self.buffer.delete(tenant_id, user_id, memory_id)

    def clear(self, tenant_id: str, user_id: str) -> int:
        return self.buffer.clear(tenant_id, user_id)

    def stats(
        self, tenant_id: str | None = None, user_id: str | None = None
    ) -> dict[str, int]:
        return self.buffer.stats(tenant_id, user_id)
