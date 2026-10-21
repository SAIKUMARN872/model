"""Tenant-scoped orchestration for ModelNow memory operations."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from .constants import DEFAULT_MEMORY_LIMIT
from .exceptions import MemoryNotFoundError, MemoryValidationError
from .interfaces import MemoryStore
from .models import (
    MemoryQuery,
    MemoryRecord,
    MemorySearchResult,
    MemoryStatus,
    MemoryType,
)
from .utils import ensure_utc, utc_now, validate_identifier, validate_json_object

_UNSET = object()


class MemoryEngine:
    """Coordinate memory operations over an injected, tenant-aware store.

    The store must enforce tenant scope in its own queries. This engine adds
    defense-in-depth filtering, but atomic updates require backend-level
    optimistic concurrency control.
    """

    def __init__(
        self,
        store: MemoryStore,
        *,
        tenant_id: str,
        user_id: str | None = None,
        clock=utc_now,
    ) -> None:
        if store is None:
            raise MemoryValidationError("store is required")
        self.store = store
        self.tenant_id = validate_identifier(tenant_id, field="tenant_id")
        self.user_id = (
            validate_identifier(user_id, field="user_id")
            if user_id is not None
            else None
        )
        if not callable(clock):
            raise MemoryValidationError("clock must be callable")
        self._clock = clock

    def _visible(self, record: MemoryRecord | None) -> MemoryRecord | None:
        """Hide records outside this engine's tenant or user scope."""
        if record is None or record.tenant_id != self.tenant_id:
            return None
        if self.user_id is not None and record.user_id != self.user_id:
            return None
        return record

    def create(
        self,
        content: str,
        *,
        memory_type: MemoryType = MemoryType.LONG_TERM,
        metadata: dict[str, Any] | None = None,
        importance: float = 0.5,
        expires_at: datetime | None = None,
        memory_id: str | None = None,
    ) -> MemoryRecord:
        """Create a record in the current tenant and optional user scope."""
        if self.user_id is None:
            raise MemoryValidationError(
                "user_id is required to create a user-owned memory"
            )

        now = ensure_utc(self._clock(), field="clock")
        record = MemoryRecord(
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            content=content,
            memory_type=memory_type,
            metadata=validate_json_object(metadata),
            importance=importance,
            created_at=now,
            updated_at=now,
            expires_at=expires_at,
            **({"memory_id": memory_id} if memory_id is not None else {}),
        )
        saved = self.store.save(record)
        if not isinstance(saved, MemoryRecord):
            raise TypeError("MemoryStore.save() must return a MemoryRecord")
        if saved.tenant_id != self.tenant_id or saved.user_id != self.user_id:
            raise MemoryValidationError("Storage returned a record outside the requested scope")
        return saved

    def get(self, memory_id: str) -> MemoryRecord | None:
        """Get a memory only when it belongs to the current scope."""
        memory_id = validate_identifier(memory_id, field="memory_id")
        return self._visible(self.store.get(self.tenant_id, memory_id))

    def update(
        self,
        memory_id: str,
        *,
        content: str | None = None,
        metadata: dict[str, Any] | None = None,
        importance: float | None = None,
        expires_at: datetime | None | object = _UNSET,
    ) -> MemoryRecord:
        """Update a visible record.

        Metadata is merged with existing keys. Pass expires_at=None to remove
        expiration. Concurrent writers must be coordinated by the store.
        """
        record = self.get(memory_id)
        if record is None:
            raise MemoryNotFoundError("Memory record was not found")

        if content is not None:
            record.content = content.strip()
            if not record.content:
                raise MemoryValidationError("content must not be empty")

        if metadata is not None:
            incoming = validate_json_object(metadata)
            record.metadata = validate_json_object(
                {**record.metadata, **incoming}
            )

        if importance is not None:
            record.importance = importance

        if expires_at is not _UNSET:
            record.expires_at = expires_at

        now = ensure_utc(self._clock(), field="clock")
        record.updated_at = now
        record.version += 1

        # Reconstruct to run all record invariants after mutation.
        validated = MemoryRecord.from_dict(record.to_dict())
        saved = self.store.save(validated)
        if not isinstance(saved, MemoryRecord):
            raise TypeError("MemoryStore.save() must return a MemoryRecord")
        if saved.tenant_id != self.tenant_id:
            raise MemoryValidationError("Storage returned a record outside the requested tenant")
        if self.user_id is not None and saved.user_id != self.user_id:
            raise MemoryValidationError("Storage returned a record outside the requested user")
        return saved

    def delete(self, memory_id: str) -> bool:
        """Delete a visible memory without exposing cross-tenant existence."""
        memory_id = validate_identifier(memory_id, field="memory_id")
        if self.get(memory_id) is None:
            return False
        return bool(self.store.delete(self.tenant_id, memory_id))

    def search(
        self,
        query: str | None = None,
        *,
        limit: int = DEFAULT_MEMORY_LIMIT,
        memory_types: tuple[MemoryType, ...] = (),
        metadata_filters: dict[str, Any] | None = None,
        include_expired: bool = False,
    ) -> list[MemorySearchResult]:
        """Search memory and enforce scope and lifecycle filters on results."""
        request = MemoryQuery(
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            query=query,
            limit=limit,
            memory_types=memory_types,
            metadata_filters=metadata_filters or {},
            include_expired=include_expired,
        )

        results = self.store.search(request)
        now = ensure_utc(self._clock(), field="clock")
        visible: list[MemorySearchResult] = []

        for result in results:
            if not isinstance(result, MemorySearchResult):
                raise TypeError("MemoryStore.search() must return MemorySearchResult items")

            record = result.record
            if record.tenant_id != self.tenant_id:
                continue
            if self.user_id is not None and record.user_id != self.user_id:
                continue
            if record.status != MemoryStatus.ACTIVE:
                continue
            if not request.include_expired and record.is_expired(at=now):
                continue
            if request.memory_types and record.memory_type not in request.memory_types:
                continue
            if any(
                record.metadata.get(key) != value
                for key, value in request.metadata_filters.items()
            ):
                continue

            visible.append(result)

        visible.sort(key=lambda item: item.score, reverse=True)
        return visible[:request.limit]
