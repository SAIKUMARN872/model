"""Chronological timeline interface."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from ai.memory.episodic.events import EpisodicEvent
from ai.memory.episodic.memory import EpisodicMemory


@dataclass(frozen=True, slots=True)
class TimelinePage:
    events: tuple[EpisodicEvent, ...]
    has_more: bool
    next_before: datetime | None


class EpisodicTimeline:
    def __init__(self, memory: EpisodicMemory) -> None:
        self._memory = memory

    def page(
        self, tenant_id: str, user_id: str, *, limit: int = 50,
        event_types: set[str] | None = None,
        start: datetime | None = None, end: datetime | None = None,
        min_importance: float | None = None, before: datetime | None = None,
    ) -> TimelinePage:
        if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= 500:
            raise ValueError("limit must be between 1 and 500")
        fetched = self._memory.query(
            tenant_id, user_id, limit=limit + 1,
            event_types=event_types, start=start, end=end,
            min_importance=min_importance, before=before,
        )
        has_more = len(fetched) > limit
        selected = fetched[:limit]
        cursor = selected[-1].occurred_at if has_more and selected else None
        return TimelinePage(tuple(selected), has_more, cursor)
