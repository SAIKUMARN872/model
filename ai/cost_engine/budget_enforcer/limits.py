from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from datetime import datetime, timezone
from threading import RLock
from typing import Dict, Optional


@dataclass(frozen=True)
class BudgetLimit:
    """
    Hard and soft limits for one ModelNow scope.

    Scope examples:
        tenant
        organization
        project
        user
        agent
        workflow
        request
    """

    scope_id: str

    daily_limit: Decimal = Decimal("0")
    monthly_limit: Decimal = Decimal("0")

    soft_limit_percent: Decimal = Decimal("80")
    hard_limit_percent: Decimal = Decimal("100")

    max_request_cost: Decimal = Decimal("0")
    max_tokens_per_request: int = 0

    allow_overage: bool = False

    currency: str = "USD"

    def __post_init__(self) -> None:
        if self.daily_limit < 0:
            raise ValueError("daily_limit cannot be negative")

        if self.monthly_limit < 0:
            raise ValueError("monthly_limit cannot be negative")

        if not Decimal("0") < self.soft_limit_percent <= Decimal("100"):
            raise ValueError("soft_limit_percent must be between 0 and 100")

        if not Decimal("0") < self.hard_limit_percent <= Decimal("100"):
            raise ValueError("hard_limit_percent must be between 0 and 100")

        if self.soft_limit_percent > self.hard_limit_percent:
            raise ValueError(
                "soft_limit_percent cannot exceed hard_limit_percent"
            )


@dataclass
class SpendSnapshot:
    scope_id: str
    daily_spend: Decimal = Decimal("0")
    monthly_spend: Decimal = Decimal("0")
    reserved_spend: Decimal = Decimal("0")

    updated_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    @property
    def effective_daily_spend(self) -> Decimal:
        return self.daily_spend + self.reserved_spend

    @property
    def effective_monthly_spend(self) -> Decimal:
        return self.monthly_spend + self.reserved_spend


class BudgetStore:
    """
    Thread-safe in-memory budget store.

    Production deployment should replace this with Redis/PostgreSQL,
    while preserving this interface.
    """

    def __init__(self) -> None:
        self._limits: Dict[str, BudgetLimit] = {}
        self._spend: Dict[str, SpendSnapshot] = {}
        self._lock = RLock()

    def set_limit(self, limit: BudgetLimit) -> None:
        with self._lock:
            self._limits[limit.scope_id] = limit

    def get_limit(self, scope_id: str) -> Optional[BudgetLimit]:
        with self._lock:
            return self._limits.get(scope_id)

    def get_spend(self, scope_id: str) -> SpendSnapshot:
        with self._lock:
            if scope_id not in self._spend:
                self._spend[scope_id] = SpendSnapshot(scope_id=scope_id)

            return self._spend[scope_id]

    def reserve(
        self,
        scope_id: str,
        amount: Decimal,
    ) -> SpendSnapshot:
        if amount < 0:
            raise ValueError("reservation amount cannot be negative")

        with self._lock:
            snapshot = self.get_spend(scope_id)
            snapshot.reserved_spend += amount
            snapshot.updated_at = datetime.now(timezone.utc)
            return snapshot

    def release(
        self,
        scope_id: str,
        amount: Decimal,
    ) -> SpendSnapshot:
        if amount < 0:
            raise ValueError("release amount cannot be negative")

        with self._lock:
            snapshot = self.get_spend(scope_id)
            snapshot.reserved_spend = max(
                Decimal("0"),
                snapshot.reserved_spend - amount,
            )
            snapshot.updated_at = datetime.now(timezone.utc)
            return snapshot

    def commit(
        self,
        scope_id: str,
        amount: Decimal,
    ) -> SpendSnapshot:
        if amount < 0:
            raise ValueError("commit amount cannot be negative")

        with self._lock:
            snapshot = self.get_spend(scope_id)

            snapshot.reserved_spend = max(
                Decimal("0"),
                snapshot.reserved_spend - amount,
            )

            snapshot.daily_spend += amount
            snapshot.monthly_spend += amount
            snapshot.updated_at = datetime.now(timezone.utc)

            return snapshot