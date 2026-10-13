"""Thread-safe in-memory store for scoped agent memories."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from threading import RLock
from typing import Any

from .context import MemoryContext
from .utils import copy_metadata, normalize_memory_key, validate_text


@dataclass(frozen=True)
class MemoryRecord:
    key: str
    value: Any
    context: MemoryContext
    created_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    metadata: dict[str, Any] = field(default_factory=dict)


class MemoryManager:
    """Stores memories by context scope and normalized key.

    This implementation is process-local and does not persist across restarts.
    """

    def __init__(self) -> None:
        self._records: dict[tuple, dict[str, MemoryRecord]] = {}
        self._lock = RLock()

    @staticmethod
    def _context(context: MemoryContext | Any | None) -> MemoryContext:
        if isinstance(context, MemoryContext):
            return context
        return MemoryContext.from_agent_context(context)

    def store(
        self,
        key: str,
        value: Any,
        context: MemoryContext | Any | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> MemoryRecord:
        normalized_key = normalize_memory_key(key)
        if value is None:
            raise ValueError("value cannot be None.")
        scope = self._context(context)
        scope_key = scope.scope_key()
        now = datetime.now(timezone.utc)

        with self._lock:
            bucket = self._records.setdefault(scope_key, {})
            previous = bucket.get(normalized_key)
            record = MemoryRecord(
                key=normalized_key,
                value=value,
                context=scope,
                created_at=previous.created_at if previous else now,
                updated_at=now,
                metadata=copy_metadata(metadata),
            )
            bucket[normalized_key] = record
            return record

    def retrieve(
        self, key: str, context: MemoryContext | Any | None = None
    ) -> MemoryRecord | None:
        normalized_key = normalize_memory_key(key)
        scope_key = self._context(context).scope_key()
        with self._lock:
            return self._records.get(scope_key, {}).get(normalized_key)

    def get_value(
        self, key: str, context: MemoryContext | Any | None = None,
        default: Any = None,
    ) -> Any:
        record = self.retrieve(key, context)
        return record.value if record is not None else default

    def delete(
        self, key: str, context: MemoryContext | Any | None = None
    ) -> bool:
        normalized_key = normalize_memory_key(key)
        scope_key = self._context(context).scope_key()
        with self._lock:
            bucket = self._records.get(scope_key)
            if not bucket or normalized_key not in bucket:
                return False
            del bucket[normalized_key]
            if not bucket:
                del self._records[scope_key]
            return True

    def list_memories(
        self, context: MemoryContext | Any | None = None
    ) -> list[MemoryRecord]:
        scope_key = self._context(context).scope_key()
        with self._lock:
            return list(self._records.get(scope_key, {}).values())

    def clear(self, context: MemoryContext | Any | None = None) -> int:
        scope_key = self._context(context).scope_key()
        with self._lock:
            records = self._records.pop(scope_key, {})
            return len(records)
