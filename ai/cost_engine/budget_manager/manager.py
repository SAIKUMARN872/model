from __future__ import annotations

from decimal import Decimal
from typing import Any, Dict, Optional

from .allocator import BudgetAllocator
from .budget_history import BudgetHistory
from .models import BudgetAccount, BudgetAllocation, BudgetSpend
from .tracker import BudgetTracker


class BudgetManager:
    """Coordinates budget allocation, spending, and audit history."""

    def __init__(
        self,
        allocator: Optional[BudgetAllocator] = None,
        tracker: Optional[BudgetTracker] = None,
        history: Optional[BudgetHistory] = None,
    ) -> None:
        self.allocator = allocator or BudgetAllocator()
        self.tracker = tracker or BudgetTracker(self.allocator)
        self.history = history or BudgetHistory()

    def create_budget(
        self,
        budget_id: str,
        limit: Decimal,
        currency: str = "USD",
        owner_id: Optional[str] = None,
        period: str = "monthly",
    ) -> BudgetAccount:
        budget = self.allocator.create_budget(
            budget_id=budget_id,
            limit=limit,
            currency=currency,
            owner_id=owner_id,
            period=period,
        )

        self.history.record_created(
            budget_id=budget_id,
            amount=limit,
        )

        return budget

    def get_budget(
        self,
        budget_id: str,
    ) -> BudgetAccount | None:
        return self.allocator.get_budget(budget_id)

    def require_budget(
        self,
        budget_id: str,
    ) -> BudgetAccount:
        return self.allocator.require_budget(budget_id)

    def allocate(
        self,
        budget_id: str,
        amount: Decimal,
        source: str = "cost_engine",
    ) -> BudgetAllocation:
        allocation = self.allocator.allocate(
            budget_id=budget_id,
            amount=amount,
            source=source,
        )

        self.history.record_allocation(
            budget_id=budget_id,
            amount=amount,
        )

        return allocation

    def record_spend(
        self,
        budget_id: str,
        amount: Decimal,
        request_id: Optional[str] = None,
        model: Optional[str] = None,
        provider: Optional[str] = None,
    ) -> BudgetSpend:
        spend = self.tracker.record_spend(
            budget_id=budget_id,
            amount=amount,
            request_id=request_id,
            model=model,
            provider=provider,
        )

        self.history.record_spend(
            budget_id=budget_id,
            amount=amount,
            request_id=request_id,
            model=model,
            provider=provider,
        )

        return spend

    def get_spent(
        self,
        budget_id: str,
    ) -> Decimal:
        return self.tracker.get_spent(budget_id)

    def get_remaining(
        self,
        budget_id: str,
    ) -> Decimal:
        return self.tracker.get_remaining(budget_id)

    def get_utilization(
        self,
        budget_id: str,
    ) -> Decimal:
        return self.tracker.get_utilization(budget_id)

    def list_budgets(self) -> tuple[BudgetAccount, ...]:
        return self.allocator.list_budgets()

    def list_spend(
        self,
        budget_id: Optional[str] = None,
    ) -> tuple[BudgetSpend, ...]:
        return self.tracker.list_spend(budget_id)

    def list_history(
        self,
        budget_id: Optional[str] = None,
        event_type: Optional[str] = None,
    ):
        return self.history.list_events(
            budget_id=budget_id,
            event_type=event_type,
        )

    def snapshot(
        self,
        budget_id: str,
    ) -> Dict[str, Any]:
        budget = self.require_budget(budget_id)

        return {
            "budget_id": budget.budget_id,
            "limit": budget.limit,
            "spent": budget.spent,
            "remaining": budget.remaining,
            "utilization": budget.utilization,
            "exceeded": budget.exceeded,
            "currency": budget.currency,
            "owner_id": budget.owner_id,
            "period": budget.period,
        }


__all__ = ["BudgetManager"]
