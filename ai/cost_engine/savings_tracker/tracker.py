"""
Savings tracking and savings event management.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from threading import RLock
from typing import Any, Dict, List
from uuid import uuid4


class SavingsTrackingError(ValueError):
    """Raised when savings tracking data is invalid."""


@dataclass(frozen=True)
class SavingsEvent:
    """
    Represents one cost-saving event.

    Example:
        Original model cost = $1.00
        Optimized model cost = $0.40
        Savings = $0.60
    """

    event_id: str

    original_cost: Decimal
    optimized_cost: Decimal
    savings: Decimal

    currency: str

    optimization_type: str

    original_model: str | None = None
    optimized_model: str | None = None

    tenant_id: str | None = None
    project_id: str | None = None
    user_id: str | None = None

    request_id: str | None = None

    tokens_before: int = 0
    tokens_after: int = 0

    timestamp: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    metadata: Dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        if self.original_cost < 0:
            raise SavingsTrackingError(
                "original_cost cannot be negative"
            )

        if self.optimized_cost < 0:
            raise SavingsTrackingError(
                "optimized_cost cannot be negative"
            )

        if self.savings < 0:
            raise SavingsTrackingError(
                "savings cannot be negative"
            )

        if self.tokens_before < 0:
            raise SavingsTrackingError(
                "tokens_before cannot be negative"
            )

        if self.tokens_after < 0:
            raise SavingsTrackingError(
                "tokens_after cannot be negative"
            )

        if not self.currency:
            raise SavingsTrackingError(
                "currency cannot be empty"
            )

        if not self.optimization_type:
            raise SavingsTrackingError(
                "optimization_type cannot be empty"
            )

    @property
    def savings_percent(self) -> Decimal:

        if self.original_cost <= 0:
            return Decimal("0")

        return (
            self.savings
            / self.original_cost
            * Decimal("100")
        )

    @property
    def token_reduction(self) -> int:

        return max(
            0,
            self.tokens_before
            - self.tokens_after,
        )

    @property
    def token_reduction_percent(self) -> Decimal:

        if self.tokens_before <= 0:
            return Decimal("0")

        return (
            Decimal(self.token_reduction)
            / Decimal(self.tokens_before)
            * Decimal("100")
        )

    def to_dict(self) -> dict[str, Any]:

        return {
            "event_id": self.event_id,
            "original_cost": str(
                self.original_cost
            ),
            "optimized_cost": str(
                self.optimized_cost
            ),
            "savings": str(
                self.savings
            ),
            "savings_percent": str(
                self.savings_percent
            ),
            "currency": self.currency,
            "optimization_type": (
                self.optimization_type
            ),
            "original_model": self.original_model,
            "optimized_model": self.optimized_model,
            "tenant_id": self.tenant_id,
            "project_id": self.project_id,
            "user_id": self.user_id,
            "request_id": self.request_id,
            "tokens_before": self.tokens_before,
            "tokens_after": self.tokens_after,
            "token_reduction": self.token_reduction,
            "token_reduction_percent": str(
                self.token_reduction_percent
            ),
            "timestamp": self.timestamp.isoformat(),
            "metadata": self.metadata,
        }


class SavingsTracker:
    """
    Thread-safe savings tracker.

    Stores optimization events and provides
    aggregate savings information.
    """

    def __init__(self) -> None:

        self._events: List[SavingsEvent] = []

        self._lock = RLock()

    def record(
        self,
        original_cost: Decimal,
        optimized_cost: Decimal,
        optimization_type: str,
        currency: str = "USD",
        original_model: str | None = None,
        optimized_model: str | None = None,
        tenant_id: str | None = None,
        project_id: str | None = None,
        user_id: str | None = None,
        request_id: str | None = None,
        tokens_before: int = 0,
        tokens_after: int = 0,
        metadata: Dict[str, Any] | None = None,
    ) -> SavingsEvent:

        original_cost = Decimal(
            str(original_cost)
        )

        optimized_cost = Decimal(
            str(optimized_cost)
        )

        savings = max(
            Decimal("0"),
            original_cost - optimized_cost,
        )

        event = SavingsEvent(
            event_id=str(uuid4()),
            original_cost=original_cost,
            optimized_cost=optimized_cost,
            savings=savings,
            currency=currency,
            optimization_type=optimization_type,
            original_model=original_model,
            optimized_model=optimized_model,
            tenant_id=tenant_id,
            project_id=project_id,
            user_id=user_id,
            request_id=request_id,
            tokens_before=tokens_before,
            tokens_after=tokens_after,
            metadata=metadata or {},
        )

        with self._lock:
            self._events.append(event)

        return event

    def add_event(
        self,
        event: SavingsEvent,
    ) -> SavingsEvent:

        with self._lock:
            self._events.append(event)

        return event

    def get(
        self,
        event_id: str,
    ) -> SavingsEvent | None:

        with self._lock:

            for event in self._events:

                if event.event_id == event_id:
                    return event

        return None

    def all_events(self) -> List[SavingsEvent]:

        with self._lock:
            return list(self._events)

    def by_type(
        self,
        optimization_type: str,
    ) -> List[SavingsEvent]:

        with self._lock:

            return [
                event
                for event in self._events
                if event.optimization_type
                == optimization_type
            ]

    def by_tenant(
        self,
        tenant_id: str,
    ) -> List[SavingsEvent]:

        with self._lock:

            return [
                event
                for event in self._events
                if event.tenant_id == tenant_id
            ]

    def by_project(
        self,
        project_id: str,
    ) -> List[SavingsEvent]:

        with self._lock:

            return [
                event
                for event in self._events
                if event.project_id == project_id
            ]

    def total_savings(
        self,
        currency: str = "USD",
    ) -> Decimal:

        with self._lock:

            return sum(
                (
                    event.savings
                    for event in self._events
                    if event.currency == currency
                ),
                Decimal("0"),
            )

    def total_original_cost(
        self,
        currency: str = "USD",
    ) -> Decimal:

        with self._lock:

            return sum(
                (
                    event.original_cost
                    for event in self._events
                    if event.currency == currency
                ),
                Decimal("0"),
            )

    def total_optimized_cost(
        self,
        currency: str = "USD",
    ) -> Decimal:

        with self._lock:

            return sum(
                (
                    event.optimized_cost
                    for event in self._events
                    if event.currency == currency
                ),
                Decimal("0"),
            )

    def savings_percentage(
        self,
        currency: str = "USD",
    ) -> Decimal:

        original = self.total_original_cost(
            currency
        )

        if original <= 0:
            return Decimal("0")

        return (
            self.total_savings(currency)
            / original
            * Decimal("100")
        )

    def clear(self) -> None:

        with self._lock:
            self._events.clear()