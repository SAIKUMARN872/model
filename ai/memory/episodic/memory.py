"""Thread-safe, tenant-scoped episodic event store."""
from __future__ import annotations

import threading
from collections import defaultdict
from datetime import datetime
from typing import Iterable

from ai.memory.exceptions import MemoryConflictError, MemoryValidationError
from ai.memory.episodic.events import EpisodicEvent
from ai.memory.episodic.utils import (
    normalize_datetime, normalize_event_type, validate_identifier, validate_score,
)


class EpisodicMemory:
    """In-memory repository for development and tests.

    Replace with a transactional database adapter for shared production use.
    """

    def __init__(self) -> None:
        self._lock = threading.RLock()
        self._events: dict[tuple[str, str, str], EpisodicEvent] = {}
        self._idempotency: dict[tuple[str, str, str], str] = {}
        self._owners: dict[tuple[str, str], list[str]] = defaultdict(list)

    def record(
        self, event: EpisodicEvent, *, idempotency_key: str | None = None,
    ) -> EpisodicEvent:
        if not isinstance(event, EpisodicEvent):
            raise TypeError("event must be an EpisodicEvent")
        owner = (event.tenant_id, event.user_id)
        key = (*owner, event.event_id)
        idem_key = None
        if idempotency_key is not None:
            idem = validate_identifier(idempotency_key, "idempotency_key")
            if len(idem) > 256:
                raise MemoryValidationError("idempotency_key is too long")
            idem_key = (*owner, idem)

        with self._lock:
            if idem_key is not None and idem_key in self._idempotency:
                old_id = self._idempotency[idem_key]
                old = self._events.get((*owner, old_id))
                if old is not None:
                    return old
            existing = self._events.get(key)
            if existing is not None:
                if existing != event:
                    raise MemoryConflictError(
                        "event_id already exists with different data"
                    )
                return existing
            self._events[key] = event
            self._owners[owner].append(event.event_id)
            if idem_key is not None:
                self._idempotency[idem_key] = event.event_id
            return event

    def get(
        self, tenant_id: str, user_id: str, event_id: str,
    ) -> EpisodicEvent | None:
        owner = (
            validate_identifier(tenant_id, "tenant_id"),
            validate_identifier(user_id, "user_id"),
        )
        event_id = validate_identifier(event_id, "event_id")
        with self._lock:
            return self._events.get((*owner, event_id))

    def query(
        self, tenant_id: str, user_id: str, *,
        event_types: Iterable[str] | None = None,
        start: datetime | None = None, end: datetime | None = None,
        min_importance: float | None = None, limit: int = 50,
        before: datetime | None = None,
    ) -> list[EpisodicEvent]:
        owner = (
            validate_identifier(tenant_id, "tenant_id"),
            validate_identifier(user_id, "user_id"),
        )
        if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= 500:
            raise MemoryValidationError("limit must be between 1 and 500")
        start_at = normalize_datetime(start) if start is not None else None
        end_at = normalize_datetime(end) if end is not None else None
        before_at = normalize_datetime(before) if before is not None else None
        if start_at is not None and end_at is not None and start_at > end_at:
            raise MemoryValidationError("start must not be after end")
        if min_importance is not None:
            min_importance = validate_score(min_importance, "min_importance")
        types = None
        if event_types is not None:
            types = {normalize_event_type(item) for item in event_types}
            if not types:
                return []

        with self._lock:
            ids = tuple(self._owners.get(owner, ()))
            events = [
                self._events[(*owner, event_id)]
                for event_id in ids if (*owner, event_id) in self._events
            ]

        selected = []
        for event in events:
            if types is not None and event.event_type not in types:
                continue
            if start_at is not None and event.occurred_at < start_at:
                continue
            if end_at is not None and event.occurred_at > end_at:
                continue
            if before_at is not None and event.occurred_at >= before_at:
                continue
            if min_importance is not None and event.importance < min_importance:
                continue
            selected.append(event)
        selected.sort(
            key=lambda item: (item.occurred_at, item.event_id), reverse=True
        )
        return selected[:limit]

    def delete(self, tenant_id: str, user_id: str, event_id: str) -> bool:
        owner = (
            validate_identifier(tenant_id, "tenant_id"),
            validate_identifier(user_id, "user_id"),
        )
        event_id = validate_identifier(event_id, "event_id")
        key = (*owner, event_id)
        with self._lock:
            if key not in self._events:
                return False
            del self._events[key]
            self._owners[owner] = [
                item for item in self._owners[owner] if item != event_id
            ]
            for idem_key, stored_id in list(self._idempotency.items()):
                if idem_key[:2] == owner and stored_id == event_id:
                    del self._idempotency[idem_key]
            return True

    def count(self, tenant_id: str, user_id: str) -> int:
        owner = (
            validate_identifier(tenant_id, "tenant_id"),
            validate_identifier(user_id, "user_id"),
        )
        with self._lock:
            return len(self._owners.get(owner, ()))
