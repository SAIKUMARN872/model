from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from threading import RLock
from typing import Dict


@dataclass
class BudgetUsage:
    scope_id: str

    budget: Decimal = Decimal("0")
    spent: Decimal = Decimal("0")
    reserved: Decimal = Decimal("0")

    request_count: int = 0
    token_count: int = 0

    updated_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    @property
    def available(self) -> Decimal:
        return max(
            Decimal("0"),
            self.budget - self.spent - self.reserved,
        )

    @property
    def utilization(self) -> Decimal:
        if self.budget <= 0:
            return Decimal("0")

        return (
            (self.spent + self.reserved)
            / self.budget
        ) * Decimal("100")


class BudgetTracker:
    """
    Tracks real-time budget usage.
    """

    def __init__(self) -> None:
        self._usage: Dict[str, BudgetUsage] = {}
        self._lock = RLock()

    def create(
        self,
        scope_id: str,
        budget: Decimal,
    ) -> BudgetUsage:

        if budget < 0:
            raise ValueError("Budget cannot be negative.")

        with self._lock:
            usage = BudgetUsage(
                scope_id=scope_id,
                budget=budget,
            )

            self._usage[scope_id] = usage
            return usage

    def get(self, scope_id: str) -> BudgetUsage | None:
        with self._lock:
            return self._usage.get(scope_id)

    def reserve(
        self,
        scope_id: str,
        amount: Decimal,
    ) -> BudgetUsage:

        if amount < 0:
            raise ValueError("Reservation cannot be negative.")

        with self._lock:
            usage = self._require(scope_id)

            if amount > usage.available:
                raise ValueError(
                    f"Insufficient budget for {scope_id}. "
                    f"Available={usage.available}, requested={amount}"
                )

            usage.reserved += amount
            usage.updated_at = datetime.now(timezone.utc)

            return usage

    def release(
        self,
        scope_id: str,
        amount: Decimal,
    ) -> BudgetUsage:

        with self._lock:
            usage = self._require(scope_id)

            usage.reserved = max(
                Decimal("0"),
                usage.reserved - amount,
            )

            usage.updated_at = datetime.now(timezone.utc)

            return usage

    def record_spend(
        self,
        scope_id: str,
        amount: Decimal,
        tokens: int = 0,
    ) -> BudgetUsage:

        if amount < 0:
            raise ValueError("Spend cannot be negative.")

        if tokens < 0:
            raise ValueError("Token count cannot be negative.")

        with self._lock:
            usage = self._require(scope_id)

            usage.reserved = max(
                Decimal("0"),
                usage.reserved - amount,
            )

            usage.spent += amount
            usage.token_count += tokens
            usage.request_count += 1

            usage.updated_at = datetime.now(timezone.utc)

            return usage

    def _require(self, scope_id: str) -> BudgetUsage:
        usage = self._usage.get(scope_id)

        if usage is None:
            raise KeyError(
                f"No budget exists for scope: {scope_id}"
            )

        return usage