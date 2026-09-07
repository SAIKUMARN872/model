from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from threading import RLock
from typing import Any, Dict, List


@dataclass
class ChargebackEvent:
    event_id: str
    chargeback_id: str
    target_id: str
    amount: Decimal
    currency: str
    event_type: str
    timestamp: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    metadata: Dict[str, Any] = field(default_factory=dict)


class ChargebackHistory:
    """
    Thread-safe in-memory chargeback history.

    This can later be replaced with PostgreSQL, MongoDB,
    Redis Streams, Kafka, etc.
    """

    def __init__(self) -> None:
        self._events: List[ChargebackEvent] = []
        self._lock = RLock()

    def record(self, event: ChargebackEvent) -> ChargebackEvent:
        with self._lock:
            self._events.append(event)

        return event

    def get_all(self) -> List[ChargebackEvent]:
        with self._lock:
            return list(self._events)

    def get_by_chargeback(
        self,
        chargeback_id: str,
    ) -> List[ChargebackEvent]:

        with self._lock:
            return [
                event
                for event in self._events
                if event.chargeback_id == chargeback_id
            ]

    def get_by_target(
        self,
        target_id: str,
    ) -> List[ChargebackEvent]:

        with self._lock:
            return [
                event
                for event in self._events
                if event.target_id == target_id
            ]

    def clear(self) -> None:
        with self._lock:
            self._events.clear()