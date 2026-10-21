"""In-process telemetry event recording."""

from dataclasses import dataclass
from datetime import datetime, timezone
from threading import RLock


@dataclass(frozen=True)
class TelemetryEvent:
    name: str
    timestamp: str
    attributes: dict


class TelemetryRecorder:
    """Records timestamped events for diagnostics and unit tests."""

    def __init__(self, max_events=1000):
        if not isinstance(max_events, int) or isinstance(max_events, bool):
            raise TypeError("max_events must be an integer")
        if max_events < 1:
            raise ValueError("max_events must be at least 1")
        self.max_events = max_events
        self._lock = RLock()
        self._events = []

    def record(self, name, **attributes):
        event = TelemetryEvent(
            name=str(name),
            timestamp=datetime.now(timezone.utc).isoformat(),
            attributes=dict(attributes),
        )
        with self._lock:
            self._events.append(event)
            if len(self._events) > self.max_events:
                self._events = self._events[-self.max_events:]
        return event

    def get_events(self, name=None):
        with self._lock:
            events = tuple(self._events)
        if name is not None:
            events = tuple(event for event in events if event.name == name)
        return events

    def clear(self):
        with self._lock:
            self._events.clear()
