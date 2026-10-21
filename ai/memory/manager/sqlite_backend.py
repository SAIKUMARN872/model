from __future__ import annotations

import math
import re
from collections.abc import Mapping
from datetime import datetime, timezone
from typing import Any

from ai.memory.manager.manager import MemoryBackend
from ai.memory.manager.utils import MemoryContext, MemoryItem
from ai.memory.storage.storage import SQLiteMemoryStorage


class SQLiteMemoryBackend:
    """Persistent, tenant-scoped MemoryBackend backed by SQLite."""

    name = "sqlite"
    _MARKER = "_modelnow_manager_backend"

    def __init__(self, storage: SQLiteMemoryStorage) -> None:
        if not isinstance(storage, SQLiteMemoryStorage):
            raise TypeError("storage must be a SQLiteMemoryStorage instance")
        self._storage = storage

    @staticmethod
    def _validate_context(context: MemoryContext) -> None:
        if not isinstance(context, MemoryContext):
            raise TypeError("context must be a MemoryContext")
        if not context.tenant_id or not context.user_id:
            raise ValueError("tenant_id and user_id are required")

    @staticmethod
    def _tokens(value: str) -> set[str]:
        return set(re.findall(r"[a-z0-9_]+", value.casefold()))

    def write(
        self,
        context: MemoryContext,
        content: str,
        *,
        category: str,
        metadata: dict,
    ) -> str:
        self._validate_context(context)
        if not isinstance(content, str) or not content.strip():
            raise ValueError("content must be a non-empty string")
        if not isinstance(category, str) or not category.strip():
            raise ValueError("category must be a non-empty string")
        if not isinstance(metadata, Mapping):
            raise TypeError("metadata must be a mapping")

        user_metadata = dict(metadata)
        if self._MARKER in user_metadata:
            raise ValueError("metadata contains a reserved key")

        record = self._storage.save(
            tenant_id=context.tenant_id,
            user_id=context.user_id,
            content=content.strip(),
            memory_type="manager",
            metadata={
                self._MARKER: {"category": category.strip(), "metadata": user_metadata}
            },
        )

        memory_id = record.get("memory_id") if isinstance(record, dict) else None
        if not isinstance(memory_id, str) or not memory_id:
            raise ValueError("SQLite storage returned an invalid memory ID")

        return memory_id

    def search(
        self,
        context: MemoryContext,
        query: str,
        *,
        limit: int,
        category: str | None = None,
    ) -> list[MemoryItem]:
        self._validate_context(context)
        if not isinstance(query, str):
            raise TypeError("query must be a string")
        if isinstance(limit, bool) or not isinstance(limit, int) or limit < 1:
            raise ValueError("limit must be a positive integer")
        if limit > 500:
            raise ValueError("limit cannot exceed 500")
        if category is not None and (
            not isinstance(category, str) or not category.strip()
        ):
            raise ValueError("category must be a non-empty string when provided")

        records = self._storage.search(
            tenant_id=context.tenant_id,
            user_id=context.user_id,
            memory_type="manager",
            limit=500,
        )
        query_tokens = self._tokens(query)
        results: list[MemoryItem] = []

        for record in records:
            raw_metadata = record.get("metadata") or {}
            if not isinstance(raw_metadata, Mapping):
                continue
            envelope = raw_metadata.get(self._MARKER)
            if not isinstance(envelope, Mapping):
                continue

            record_category = envelope.get("category")
            if not isinstance(record_category, str):
                continue
            if category is not None and record_category != category:
                continue

            user_metadata = envelope.get("metadata", {})
            if not isinstance(user_metadata, Mapping):
                user_metadata = {}

            content = record.get("content", "")
            if not isinstance(content, str):
                continue

            content_tokens = self._tokens(content)
            if query_tokens:
                overlap = len(query_tokens & content_tokens)
                if overlap == 0:
                    continue
                score = overlap / len(query_tokens | content_tokens)
            else:
                score = 1.0

            created_at = record.get("created_at")
            if isinstance(created_at, str):
                try:
                    created_at = datetime.fromisoformat(
                        created_at.replace("Z", "+00:00")
                    )
                except ValueError:
                    created_at = None
            if not isinstance(created_at, datetime):
                created_at = datetime.now(timezone.utc)
            elif created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=timezone.utc)

            if not math.isfinite(score) or not 0.0 <= score <= 1.0:
                continue

            results.append(
                MemoryItem(
                    memory_id=record["memory_id"],
                    backend=self.name,
                    content=content,
                    category=record_category,
                    score=score,
                    metadata=dict(user_metadata),
                    created_at=created_at,
                )
            )

        results.sort(
            key=lambda item: (item.score, item.created_at, item.memory_id),
            reverse=True,
        )
        return results[:limit]

    def delete(self, context: MemoryContext, memory_id: str) -> bool:
        self._validate_context(context)
        if not isinstance(memory_id, str) or not memory_id.strip():
            raise ValueError("memory_id must be a non-empty string")
        return self._storage.delete(
            tenant_id=context.tenant_id,
            user_id=context.user_id,
            memory_id=memory_id,
        )

