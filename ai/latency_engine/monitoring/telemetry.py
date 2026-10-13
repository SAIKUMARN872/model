from __future__ import annotations

from dataclasses import dataclass, field
from threading import Lock
from time import time
from typing import Callable


@dataclass(frozen=True)
class TelemetryEvent:
    name: str
    timestamp: float
    request_id: str | None = None
    duration_ms: float | None = None
    attributes: dict[str, object] = field(
        default_factory=dict
    )


TelemetryHandler = Callable[[TelemetryEvent], None]


class LatencyTelemetry:
    """Thread-safe telemetry publisher for latency events."""

    def __init__(
        self,
        *,
        max_events: int = 10000,
    ) -> None:
        if max_events <= 0:
            raise ValueError(
                "max_events must be positive"
            )

        self._max_events = max_events
        self._events: list[TelemetryEvent] = []
        self._handlers: list[TelemetryHandler] = []
        self._counters: dict[str, int] = {}
        self._lock = Lock()

    @staticmethod
    def _validate_name(name: str) -> str:
        value = str(name).strip()

        if not value:
            raise ValueError(
                "event name cannot be empty"
            )

        return value

    @staticmethod
    def _validate_duration(
        duration_ms: float | None,
    ) -> float | None:
        if duration_ms is None:
            return None

        value = float(duration_ms)

        if value < 0:
            raise ValueError(
                "duration_ms cannot be negative"
            )

        return value

    def subscribe(
        self,
        handler: TelemetryHandler,
    ) -> None:
        if not callable(handler):
            raise TypeError(
                "handler must be callable"
            )

        with self._lock:
            if handler not in self._handlers:
                self._handlers.append(handler)

    def unsubscribe(
        self,
        handler: TelemetryHandler,
    ) -> None:
        with self._lock:
            if handler in self._handlers:
                self._handlers.remove(handler)

    def emit(
        self,
        name: str,
        *,
        request_id: str | None = None,
        duration_ms: float | None = None,
        attributes: dict[str, object] | None = None,
    ) -> TelemetryEvent:
        event_name = self._validate_name(name)

        if request_id is not None:
            request_id = str(request_id).strip()

            if not request_id:
                raise ValueError(
                    "request_id cannot be empty"
                )

        duration = self._validate_duration(
            duration_ms
        )

        event = TelemetryEvent(
            name=event_name,
            timestamp=time(),
            request_id=request_id,
            duration_ms=duration,
            attributes=dict(attributes or {}),
        )

        with self._lock:
            self._events.append(event)

            if len(self._events) > self._max_events:
                del self._events[
                    : len(self._events) - self._max_events
                ]

            self._counters[event_name] = (
                self._counters.get(event_name, 0) + 1
            )

            handlers = tuple(self._handlers)

        for handler in handlers:
            try:
                handler(event)
            except Exception:
                # Telemetry must never break the request path.
                continue

        return event

    def events(
        self,
        name: str | None = None,
    ) -> tuple[TelemetryEvent, ...]:
        with self._lock:
            events = tuple(self._events)

        if name is None:
            return events

        event_name = self._validate_name(name)

        return tuple(
            event
            for event in events
            if event.name == event_name
        )

    def counter(
        self,
        name: str,
    ) -> int:
        event_name = self._validate_name(name)

        with self._lock:
            return self._counters.get(
                event_name,
                0,
            )

    def counters(self) -> dict[str, int]:
        with self._lock:
            return dict(self._counters)

    def clear(self) -> None:
        with self._lock:
            self._events.clear()
            self._counters.clear()

    @property
    def max_events(self) -> int:
        return self._max_events


__all__ = [
    "TelemetryEvent",
    "TelemetryHandler",
    "LatencyTelemetry",
]
