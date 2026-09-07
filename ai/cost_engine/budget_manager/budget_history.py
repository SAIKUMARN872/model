from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional


@dataclass(frozen=True)
class BudgetEvent:
    scope_id: str
    event_type: str
    amount: Decimal

    request_id: Optional[str] = None
    model: Optional[str] = None
    metadata: Optional[dict] = None

    timestamp: datetime = datetime.now(timezone.utc)


class BudgetHistory:
    """
    Immutable-style event history for budget operations.
    """

    def __init__(self) -> None:
        self._events: List[BudgetEvent] = []

    def record(
        self,
        scope_id: str,
        event_type: str,
        amount: Decimal,
        request_id: str | None = None,
        model: str | None = None,
        metadata: dict | None = None,
    ) -> BudgetEvent:

        event = BudgetEvent(
            scope_id=scope_id,
            event_type=event_type,
            amount=amount,
            request_id=request_id,
            model=model,
            metadata=metadata,
            timestamp=datetime.now(timezone.utc),
        )

        self._events.append(event)

        return event

    def get(
        self,
        scope_id: str | None = None,
    ) -> List[BudgetEvent]:

        if scope_id is None:
            return list(self._events)

        return [
            event
            for event in self._events
            if event.scope_id == scope_id
        ]

    def clear(self) -> None:
        self._events.clear()