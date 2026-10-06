from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


@dataclass(frozen=True)
class InferenceTelemetryEvent:
    """Immutable inference telemetry event."""

    event_type: str
    timestamp: datetime = field(
        default_factory=lambda: datetime.now(
            timezone.utc
        )
    )
    request_id: str | None = None
    model: str | None = None
    backend: str | None = None
    metadata: dict[str, Any] = field(
        default_factory=dict
    )


class TelemetryCollector:
    """Collect inference telemetry events in memory."""

    def __init__(self) -> None:
        self._events: list[
            InferenceTelemetryEvent
        ] = []

    @property
    def events(
        self,
    ) -> tuple[InferenceTelemetryEvent, ...]:
        return tuple(self._events)

    def record(
        self,
        event: InferenceTelemetryEvent,
    ) -> None:
        self._events.append(event)

    def clear(self) -> None:
        self._events.clear()


__all__ = [
    "InferenceTelemetryEvent",
    "TelemetryCollector",
]
