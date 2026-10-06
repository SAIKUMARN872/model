from __future__ import annotations

from decimal import Decimal
from typing import Optional

from ..budget_manager.manager import BudgetManager
from .exceptions import (
    BudgetExceededError,
    BudgetNotFoundError,
    InvalidBudgetRequestError,
)
from .models import BudgetCheck, EnforcementAction
from .policies import BudgetPolicy
from .utils import (
    calculate_projected_spend,
    calculate_remaining,
    calculate_utilization,
    to_decimal,
)


class BudgetEnforcer:
    """Enforces budget limits before a request is executed."""

    def __init__(
        self,
        budget_manager: BudgetManager,
        policy: Optional[BudgetPolicy] = None,
    ) -> None:
        self.budget_manager = budget_manager
        self.policy = policy or BudgetPolicy()

    def check(
        self,
        budget_id: str,
        requested_cost: Decimal,
    ) -> BudgetCheck:
        if not budget_id or not budget_id.strip():
            raise InvalidBudgetRequestError(
                "budget_id cannot be empty"
            )

        requested_cost = to_decimal(requested_cost)

        if requested_cost < Decimal("0"):
            raise InvalidBudgetRequestError(
                "requested_cost cannot be negative"
            )

        budget = self.budget_manager.get_budget(budget_id)

        if budget is None:
            raise BudgetNotFoundError(
                f"Budget not found: {budget_id}"
            )

        projected_spend = calculate_projected_spend(
            budget.spent,
            requested_cost,
        )

        remaining = calculate_remaining(
            budget.limit,
            projected_spend,
        )

        utilization = calculate_utilization(
            budget.limit,
            projected_spend,
        )

        action = self.policy.evaluate(
            limit=budget.limit,
            spent=budget.spent,
            requested_cost=requested_cost,
        )

        return BudgetCheck(
            budget_id=budget.budget_id,
            limit=budget.limit,
            spent=budget.spent,
            requested_cost=requested_cost,
            remaining=remaining,
            utilization=utilization,
            action=action,
            exceeded=projected_spend > budget.limit,
            warning=action == EnforcementAction.WARN,
        )

    def enforce(
        self,
        budget_id: str,
        requested_cost: Decimal,
    ) -> BudgetCheck:
        result = self.check(
            budget_id=budget_id,
            requested_cost=requested_cost,
        )

        if result.action == EnforcementAction.BLOCK:
            raise BudgetExceededError(
                f"Request would exceed budget: {budget_id}"
            )

        return result

    def authorize(
        self,
        budget_id: str,
        requested_cost: Decimal,
    ) -> bool:
        result = self.enforce(
            budget_id=budget_id,
            requested_cost=requested_cost,
        )

        return result.action in {
            EnforcementAction.ALLOW,
            EnforcementAction.WARN,
        }


__all__ = ["BudgetEnforcer"]
