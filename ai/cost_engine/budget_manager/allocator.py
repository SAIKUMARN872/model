from __future__ import annotations

from decimal import Decimal
from typing import Dict, Optional

from .models import BudgetAccount, BudgetAllocation


class BudgetAllocator:
    """Creates and manages budget allocations."""

    def __init__(self) -> None:
        self._budgets: Dict[str, BudgetAccount] = {}
        self._allocations: list[BudgetAllocation] = []

    def create_budget(
        self,
        budget_id: str,
        limit: Decimal,
        currency: str = "USD",
        owner_id: Optional[str] = None,
        period: str = "monthly",
    ) -> BudgetAccount:
        if not budget_id or not budget_id.strip():
            raise ValueError("budget_id cannot be empty")

        limit = Decimal(str(limit))

        if limit <= Decimal("0"):
            raise ValueError("Budget limit must be greater than zero")

        if budget_id in self._budgets:
            raise ValueError(
                f"Budget already exists: {budget_id}"
            )

        budget = BudgetAccount(
            budget_id=budget_id,
            limit=limit,
            currency=currency.upper(),
            owner_id=owner_id,
            period=period,
        )

        self._budgets[budget_id] = budget

        return budget

    def get_budget(
        self,
        budget_id: str,
    ) -> BudgetAccount | None:
        return self._budgets.get(budget_id)

    def require_budget(
        self,
        budget_id: str,
    ) -> BudgetAccount:
        budget = self.get_budget(budget_id)

        if budget is None:
            raise LookupError(
                f"Budget not found: {budget_id}"
            )

        return budget

    def allocate(
        self,
        budget_id: str,
        amount: Decimal,
        source: str = "cost_engine",
    ) -> BudgetAllocation:
        budget = self.require_budget(budget_id)

        amount = Decimal(str(amount))

        if amount <= Decimal("0"):
            raise ValueError(
                "Allocation amount must be greater than zero"
            )

        if budget.spent + amount > budget.limit:
            raise ValueError(
                f"Allocation exceeds budget limit: {budget_id}"
            )

        allocation = BudgetAllocation(
            budget_id=budget_id,
            amount=amount,
            source=source,
        )

        self._allocations.append(allocation)

        return allocation

    def list_budgets(self) -> tuple[BudgetAccount, ...]:
        return tuple(self._budgets.values())

    def list_allocations(
        self,
        budget_id: Optional[str] = None,
    ) -> tuple[BudgetAllocation, ...]:
        if budget_id is None:
            return tuple(self._allocations)

        return tuple(
            allocation
            for allocation in self._allocations
            if allocation.budget_id == budget_id
        )


__all__ = ["BudgetAllocator"]
