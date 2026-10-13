from __future__ import annotations

import threading
from dataclasses import replace
from typing import Protocol

from ai.memory.long_term.utils import LongTermMemoryRecord, utc_now, validate_identifier


class LongTermMemoryStore(Protocol):
    def save(self, record: LongTermMemoryRecord) -> LongTermMemoryRecord: ...
    def get(self, tenant_id: str, user_id: str, memory_id: str) -> LongTermMemoryRecord | None: ...
    def list_records(
        self,
        tenant_id: str,
        user_id: str,
        *,
        include_archived: bool = False,
        category: str | None = None,
        limit: int = 100,
    ) -> list[LongTermMemoryRecord]: ...
    def delete(self, tenant_id: str, user_id: str, memory_id: str) -> bool: ...


class InMemoryLongTermMemoryStore:
    """Thread-safe, process-local storage for development and tests."""

    def __init__(self) -> None:
        self._records: dict[tuple[str, str, str], LongTermMemoryRecord] = {}
        self._lock = threading.RLock()

    @staticmethod
    def _key(tenant_id: str, user_id: str, memory_id: str) -> tuple[str, str, str]:
        return (
            validate_identifier(tenant_id, "tenant_id"),
            validate_identifier(user_id, "user_id"),
            validate_identifier(memory_id, "memory_id"),
        )

    def save(self, record: LongTermMemoryRecord) -> LongTermMemoryRecord:
        if not isinstance(record, LongTermMemoryRecord):
            raise ValueError("record must be a LongTermMemoryRecord")
        key = self._key(record.tenant_id, record.user_id, record.memory_id)
        with self._lock:
            existing = self._records.get(key)
            if existing is None:
                if record.version != 1:
                    raise ValueError("new records must start at version 1")
            else:
                if record.version != existing.version + 1:
                    raise ValueError(
                        f"version conflict: stored version is {existing.version}; "
                        f"new version must be {existing.version + 1}"
                    )
                if record.created_at != existing.created_at:
                    raise ValueError("created_at cannot change when updating a record")
            self._records[key] = record
            return LongTermMemoryRecord.from_dict(record.to_dict())

    def get(self, tenant_id: str, user_id: str, memory_id: str) -> LongTermMemoryRecord | None:
        key = self._key(tenant_id, user_id, memory_id)
        with self._lock:
            record = self._records.get(key)
            return LongTermMemoryRecord.from_dict(record.to_dict()) if record else None

    def list_records(
        self,
        tenant_id: str,
        user_id: str,
        *,
        include_archived: bool = False,
        category: str | None = None,
        limit: int = 100,
    ) -> list[LongTermMemoryRecord]:
        tenant_id = validate_identifier(tenant_id, "tenant_id")
        user_id = validate_identifier(user_id, "user_id")
        if not isinstance(include_archived, bool):
            raise ValueError("include_archived must be boolean")
        if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= 1000:
            raise ValueError("limit must be an integer between 1 and 1000")
        if category is not None:
            category = validate_identifier(category, "category")
        with self._lock:
            records = [
                record for (tenant, user, _), record in self._records.items()
                if tenant == tenant_id
                and user == user_id
                and (include_archived or not record.archived)
                and (category is None or record.category == category)
            ]
            records.sort(key=lambda item: (item.updated_at, item.memory_id), reverse=True)
            return [LongTermMemoryRecord.from_dict(item.to_dict()) for item in records[:limit]]

    def delete(self, tenant_id: str, user_id: str, memory_id: str) -> bool:
        key = self._key(tenant_id, user_id, memory_id)
        with self._lock:
            return self._records.pop(key, None) is not None

    def update_access(
        self, tenant_id: str, user_id: str, memory_id: str
    ) -> LongTermMemoryRecord | None:
        key = self._key(tenant_id, user_id, memory_id)
        with self._lock:
            record = self._records.get(key)
            if record is None:
                return None
            updated = replace(
                record,
                access_count=record.access_count + 1,
                updated_at=max(utc_now(), record.updated_at),
                version=record.version + 1,
            )
            self._records[key] = updated
            return LongTermMemoryRecord.from_dict(updated.to_dict())

    def count(self, tenant_id: str, user_id: str, *, include_archived: bool = True) -> int:
        tenant_id = validate_identifier(tenant_id, "tenant_id")
        user_id = validate_identifier(user_id, "user_id")
        if not isinstance(include_archived, bool):
            raise ValueError("include_archived must be boolean")
        with self._lock:
            return sum(
                1 for (tenant, user, _), record in self._records.items()
                if tenant == tenant_id and user == user_id
                and (include_archived or not record.archived)
            )

    def clear(self) -> None:
        with self._lock:
            self._records.clear()
