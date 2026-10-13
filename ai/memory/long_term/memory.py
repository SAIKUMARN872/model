from __future__ import annotations

from dataclasses import replace
from datetime import datetime
from typing import Any, Mapping

from ai.memory.long_term.retriever import LongTermMemoryRetriever, LongTermSearchResult
from ai.memory.long_term.storage import InMemoryLongTermMemoryStore, LongTermMemoryStore
from ai.memory.long_term.utils import (
    LongTermMemoryRecord,
    new_memory_id,
    normalize_datetime,
    validate_content,
    validate_identifier,
    validate_importance,
    validate_metadata,
    utc_now,
)


class LongTermMemory:
    """Tenant-scoped long-term memory service."""

    def __init__(
        self,
        store: LongTermMemoryStore | None = None,
        retriever: LongTermMemoryRetriever | None = None,
    ) -> None:
        self.store = store or InMemoryLongTermMemoryStore()
        self.retriever = retriever or LongTermMemoryRetriever(self.store)

    @staticmethod
    def _scope(tenant_id: str, user_id: str) -> tuple[str, str]:
        return (
            validate_identifier(tenant_id, "tenant_id"),
            validate_identifier(user_id, "user_id"),
        )

    def save(
        self,
        tenant_id: str,
        user_id: str,
        content: str,
        *,
        category: str = "general",
        importance: float = 0.5,
        metadata: Mapping[str, Any] | None = None,
        memory_id: str | None = None,
    ) -> LongTermMemoryRecord:
        tenant_id, user_id = self._scope(tenant_id, user_id)
        record = LongTermMemoryRecord(
            memory_id=memory_id or new_memory_id(),
            tenant_id=tenant_id,
            user_id=user_id,
            content=validate_content(content),
            category=validate_identifier(category, "category"),
            importance=validate_importance(importance),
            metadata=validate_metadata(metadata),
        )
        return self.store.save(record)

    def get(
        self, tenant_id: str, user_id: str, memory_id: str
    ) -> LongTermMemoryRecord | None:
        tenant_id, user_id = self._scope(tenant_id, user_id)
        return self.store.get(
            tenant_id, user_id, validate_identifier(memory_id, "memory_id")
        )

    def update(
        self,
        tenant_id: str,
        user_id: str,
        memory_id: str,
        *,
        expected_version: int,
        content: str | None = None,
        category: str | None = None,
        importance: float | None = None,
        metadata: Mapping[str, Any] | None = None,
    ) -> LongTermMemoryRecord:
        tenant_id, user_id = self._scope(tenant_id, user_id)
        memory_id = validate_identifier(memory_id, "memory_id")
        if isinstance(expected_version, bool) or not isinstance(expected_version, int) or expected_version < 1:
            raise ValueError("expected_version must be a positive integer")

        current = self.store.get(tenant_id, user_id, memory_id)
        if current is None:
            raise KeyError("memory not found")
        if current.version != expected_version:
            raise ValueError(
                f"version conflict: expected {expected_version}, found {current.version}"
            )

        merged_metadata = dict(current.metadata)
        if metadata is not None:
            merged_metadata.update(validate_metadata(metadata))

        updated = replace(
            current,
            content=validate_content(content) if content is not None else current.content,
            category=validate_identifier(category, "category") if category is not None else current.category,
            importance=validate_importance(importance) if importance is not None else current.importance,
            metadata=validate_metadata(merged_metadata),
            updated_at=max(utc_now(), current.updated_at),
            version=current.version + 1,
        )
        return self.store.save(updated)

    def archive(
        self,
        tenant_id: str,
        user_id: str,
        memory_id: str,
        *,
        expected_version: int,
    ) -> LongTermMemoryRecord:
        tenant_id, user_id = self._scope(tenant_id, user_id)
        current = self.get(tenant_id, user_id, memory_id)
        if current is None:
            raise KeyError("memory not found")
        if current.version != expected_version:
            raise ValueError("version conflict")
        if current.archived:
            return current
        archived = replace(
            current,
            archived=True,
            updated_at=max(utc_now(), current.updated_at),
            version=current.version + 1,
        )
        return self.store.save(archived)

    def restore(
        self,
        tenant_id: str,
        user_id: str,
        memory_id: str,
        *,
        expected_version: int,
    ) -> LongTermMemoryRecord:
        tenant_id, user_id = self._scope(tenant_id, user_id)
        current = self.store.get(tenant_id, user_id, memory_id)
        if current is None:
            raise KeyError("memory not found")
        if current.version != expected_version:
            raise ValueError("version conflict")
        if not current.archived:
            return current
        restored = replace(
            current,
            archived=False,
            updated_at=max(utc_now(), current.updated_at),
            version=current.version + 1,
        )
        return self.store.save(restored)

    def search(
        self,
        tenant_id: str,
        user_id: str,
        query: str,
        *,
        limit: int = 10,
        category: str | None = None,
        min_score: float = 0.0,
        half_life_days: float = 30.0,
    ) -> list[LongTermSearchResult]:
        return self.retriever.retrieve(
            tenant_id,
            user_id,
            query,
            limit=limit,
            category=category,
            min_score=min_score,
            half_life_days=half_life_days,
        )

    def list(
        self,
        tenant_id: str,
        user_id: str,
        *,
        include_archived: bool = False,
        category: str | None = None,
        limit: int = 100,
    ) -> list[LongTermMemoryRecord]:
        tenant_id, user_id = self._scope(tenant_id, user_id)
        return self.store.list_records(
            tenant_id,
            user_id,
            include_archived=include_archived,
            category=category,
            limit=limit,
        )

    def delete(self, tenant_id: str, user_id: str, memory_id: str) -> bool:
        tenant_id, user_id = self._scope(tenant_id, user_id)
        return self.store.delete(
            tenant_id, user_id, validate_identifier(memory_id, "memory_id")
        )

    def count(
        self, tenant_id: str, user_id: str, *, include_archived: bool = True
    ) -> int:
        tenant_id, user_id = self._scope(tenant_id, user_id)
        counter = getattr(self.store, "count", None)
        if not callable(counter):
            return len(
                self.store.list_records(
                    tenant_id,
                    user_id,
                    include_archived=include_archived,
                    limit=1000,
                )
            )
        return counter(tenant_id, user_id, include_archived=include_archived)


LongTermMemoryManager = LongTermMemory
