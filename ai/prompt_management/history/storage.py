"""Thread-safe in-memory storage for prompt history events."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from threading import RLock
from typing import Any
from uuid import uuid4

from .utils import validate_metadata, utc_now


@dataclass(frozen=True)
class HistoryEvent:
    event_id: str
    tenant_id: str
    prompt_id: str
    event_type: str
    timestamp: datetime
    metadata: dict[str, Any]


def _copy_event(event: HistoryEvent) -> HistoryEvent:
    return HistoryEvent(
        event_id=event.event_id,
        tenant_id=event.tenant_id,
        prompt_id=event.prompt_id,
        event_type=event.event_type,
        timestamp=event.timestamp,
        metadata=validate_metadata(event.metadata),
    )


class InMemoryHistoryStorage:
    """Stores events in process memory; data is lost when the process exits."""

    def __init__(self) -> None:
        self._events: dict[str, HistoryEvent] = {}
        self._lock = RLock()

    def append(
        self,
        tenant_id: str,
        prompt_id: str,
        event_type: str,
        metadata: dict[str, Any] | None = None,
        timestamp: datetime | None = None,
    ) -> HistoryEvent:
        event = HistoryEvent(
            event_id=str(uuid4()),
            tenant_id=tenant_id,
            prompt_id=prompt_id,
            event_type=event_type,
            timestamp=timestamp or utc_now(),
            metadata=validate_metadata(metadata),
        )
        with self._lock:
            self._events[event.event_id] = event
        return _copy_event(event)

    def get(self, event_id: str) -> HistoryEvent | None:
        with self._lock:
            event = self._events.get(event_id)
            return _copy_event(event) if event is not None else None

    def list_events(self) -> list[HistoryEvent]:
        with self._lock:
            return [_copy_event(event) for event in self._events.values()]

    def delete_prompt(self, tenant_id: str, prompt_id: str) -> int:
        with self._lock:
            event_ids = [
                event_id
                for event_id, event in self._events.items()
                if event.tenant_id == tenant_id and event.prompt_id == prompt_id
            ]
            for event_id in event_ids:
                del self._events[event_id]
            return len(event_ids)

    def count(self) -> int:
        with self._lock:
            return len(self._events)
