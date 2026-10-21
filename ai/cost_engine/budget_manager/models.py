from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional


@dataclass
class BudgetAccount:
    budget_id: str
    limit: Decimal
    spent: Decimal = Decimal("0")
    currency: str = "USD"
    owner_id: Optional[str] = None
    period: str = "monthly"
    created_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    @property
    def remaining(self) -> Decimal:
        return max(self.limit - self.spent, Decimal("0"))

    @property
    def utilization(self) -> Decimal:
        if self.limit <= Decimal("0"):
            return Decimal("0")

        return self.spent / self.limit

    @property
    def exceeded(self) -> bool:
        return self.spent > self.limit

    def record_spend(self, amount: Decimal) -> None:
        amount = Decimal(str(amount))

        if amount < Decimal("0"):
            raise ValueError("Spend amount cannot be negative")

        self.spent += amount


@dataclass(frozen=True)
class BudgetAllocation:
    budget_id: str
    amount: Decimal
    allocated_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    source: str = "cost_engine"


@dataclass(frozen=True)
class BudgetSpend:
    budget_id: str
    amount: Decimal
    request_id: Optional[str] = None
    model: Optional[str] = None
    provider: Optional[str] = None
    recorded_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


__all__ = [
    "BudgetAccount",
    "BudgetAllocation",
    "BudgetSpend",
]
