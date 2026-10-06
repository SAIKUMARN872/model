from __future__ import annotations

from decimal import Decimal
from typing import Optional

from .models import BudgetSpend
from .allocator import BudgetAllocator


class BudgetTracker:
    """Tracks actual spending against registered budgets."""

    def __init__(self, allocator: BudgetAllocator) -> None:
        self.allocator = allocator
        self._spend_records: list[BudgetSpend] = []

    def record_spend(
        self,
        budget_id: str,
        amount: Decimal,
        request_id: Optional[str] = None,
        model: Optional[str] = None,
        provider: Optional[str] = None,
    ) -> BudgetSpend:
        budget = self.allocator.require_budget(budget_id)

        amount = Decimal(str(amount))

        if amount <= Decimal("0"):
            raise ValueError(
                "Spend amount must be greater than zero"
            )

        if budget.spent + amount > budget.limit:
            raise ValueError(
                f"Spend exceeds budget limit: {budget_id}"
            )

        budget.record_spend(amount)

        record = BudgetSpend(
            budget_id=budget_id,
            amount=amount,
            request_id=request_id,
            model=model,
            provider=provider,
        )

        self._spend_records.append(record)

        return record

    def get_spent(
        self,
        budget_id: str,
    ) -> Decimal:
        budget = self.allocator.require_budget(budget_id)
        return budget.spent

    def get_remaining(
        self,
        budget_id: str,
    ) -> Decimal:
        budget = self.allocator.require_budget(budget_id)
        return budget.remaining

    def get_utilization(
        self,
        budget_id: str,
    ) -> Decimal:
        budget = self.allocator.require_budget(budget_id)
        return budget.utilization

    def list_spend(
        self,
        budget_id: Optional[str] = None,
    ) -> tuple[BudgetSpend, ...]:
        if budget_id is None:
            return tuple(self._spend_records)

        return tuple(
            record
            for record in self._spend_records
            if record.budget_id == budget_id
        )


__all__ = ["BudgetTracker"]
