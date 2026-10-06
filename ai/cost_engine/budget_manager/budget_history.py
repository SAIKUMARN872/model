from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, Optional


@dataclass(frozen=True)
class BudgetHistoryEvent:
    """Represents one budget lifecycle event."""

    budget_id: str
    event_type: str
    amount: Optional[Decimal] = None
    request_id: Optional[str] = None
    model: Optional[str] = None
    provider: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class BudgetHistory:
    """Stores budget lifecycle events for auditing and reporting."""

    def __init__(self) -> None:
        self._events: list[BudgetHistoryEvent] = []

    def record(
        self,
        budget_id: str,
        event_type: str,
        amount: Optional[Decimal] = None,
        request_id: Optional[str] = None,
        model: Optional[str] = None,
        provider: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> BudgetHistoryEvent:
        if not budget_id or not budget_id.strip():
            raise ValueError("budget_id cannot be empty")

        if not event_type or not event_type.strip():
            raise ValueError("event_type cannot be empty")

        normalized_amount = None

        if amount is not None:
            normalized_amount = Decimal(str(amount))

            if normalized_amount < Decimal("0"):
                raise ValueError(
                    "History amount cannot be negative"
                )

        event = BudgetHistoryEvent(
            budget_id=budget_id,
            event_type=event_type.strip().lower(),
            amount=normalized_amount,
            request_id=request_id,
            model=model,
            provider=provider,
            metadata=dict(metadata or {}),
        )

        self._events.append(event)

        return event

    def record_created(
        self,
        budget_id: str,
        amount: Decimal,
    ) -> BudgetHistoryEvent:
        return self.record(
            budget_id=budget_id,
            event_type="created",
            amount=amount,
        )

    def record_allocation(
        self,
        budget_id: str,
        amount: Decimal,
    ) -> BudgetHistoryEvent:
        return self.record(
            budget_id=budget_id,
            event_type="allocation",
            amount=amount,
        )

    def record_spend(
        self,
        budget_id: str,
        amount: Decimal,
        request_id: Optional[str] = None,
        model: Optional[str] = None,
        provider: Optional[str] = None,
    ) -> BudgetHistoryEvent:
        return self.record(
            budget_id=budget_id,
            event_type="spend",
            amount=amount,
            request_id=request_id,
            model=model,
            provider=provider,
        )

    def list_events(
        self,
        budget_id: Optional[str] = None,
        event_type: Optional[str] = None,
    ) -> tuple[BudgetHistoryEvent, ...]:
        events = self._events

        if budget_id is not None:
            events = [
                event
                for event in events
                if event.budget_id == budget_id
            ]

        if event_type is not None:
            normalized_type = event_type.strip().lower()

            events = [
                event
                for event in events
                if event.event_type == normalized_type
            ]

        return tuple(events)

    def count(
        self,
        budget_id: Optional[str] = None,
    ) -> int:
        return len(self.list_events(budget_id=budget_id))


__all__ = [
    "BudgetHistory",
    "BudgetHistoryEvent",
]
