"""Prompt lifecycle history recording and querying."""

from datetime import datetime
from typing import Any

from .storage import HistoryEvent, InMemoryHistoryStorage
from .utils import (
    validate_datetime,
    validate_identifier,
    validate_limit,
    validate_metadata,
)


class PromptHistory:
    def __init__(self, storage: InMemoryHistoryStorage | None = None) -> None:
        self.storage = storage or InMemoryHistoryStorage()

    def record(
        self,
        tenant_id: str,
        prompt_id: str,
        event_type: str,
        metadata: dict[str, Any] | None = None,
        timestamp: datetime | None = None,
    ) -> HistoryEvent:
        tenant_id = validate_identifier(tenant_id, "tenant_id")
        prompt_id = validate_identifier(prompt_id, "prompt_id")
        event_type = validate_identifier(event_type, "event_type")
        metadata = validate_metadata(metadata)
        timestamp = validate_datetime(timestamp, "timestamp")

        return self.storage.append(
            tenant_id=tenant_id,
            prompt_id=prompt_id,
            event_type=event_type,
            metadata=metadata,
            timestamp=timestamp,
        )

    def get(self, tenant_id: str, event_id: str) -> HistoryEvent:
        tenant_id = validate_identifier(tenant_id, "tenant_id")
        event_id = validate_identifier(event_id, "event_id")
        event = self.storage.get(event_id)

        if event is None or event.tenant_id != tenant_id:
            raise KeyError(f"History event {event_id!r} was not found.")

        return event

    def list_events(
        self,
        tenant_id: str,
        prompt_id: str | None = None,
        event_type: str | None = None,
        limit: int | None = None,
        since: datetime | None = None,
        until: datetime | None = None,
    ) -> list[HistoryEvent]:
        tenant_id = validate_identifier(tenant_id, "tenant_id")
        if prompt_id is not None:
            prompt_id = validate_identifier(prompt_id, "prompt_id")
        if event_type is not None:
            event_type = validate_identifier(event_type, "event_type")

        limit = validate_limit(limit)
        since = validate_datetime(since, "since")
        until = validate_datetime(until, "until")

        if since is not None and until is not None and since > until:
            raise ValueError("since must not be later than until.")

        events = [
            event
            for event in self.storage.list_events()
            if event.tenant_id == tenant_id
            and (prompt_id is None or event.prompt_id == prompt_id)
            and (event_type is None or event.event_type == event_type)
            and (since is None or event.timestamp >= since)
            and (until is None or event.timestamp <= until)
        ]

        events.sort(key=lambda event: (event.timestamp, event.event_id))
        if limit is not None:
            events = events[:limit]
        return events

    def delete_prompt_history(self, tenant_id: str, prompt_id: str) -> int:
        tenant_id = validate_identifier(tenant_id, "tenant_id")
        prompt_id = validate_identifier(prompt_id, "prompt_id")
        return self.storage.delete_prompt(tenant_id, prompt_id)
