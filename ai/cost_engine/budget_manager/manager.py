from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Optional

from .allocator import BudgetAllocator
from .budget_history import BudgetHistory
from .tracker import BudgetTracker
from .utils import money, remaining, utilization


@dataclass(frozen=True)
class BudgetConfig:
    scope_id: str

    amount: Decimal

    currency: str = "USD"

    daily_limit: Optional[Decimal] = None
    monthly_limit: Optional[Decimal] = None


@dataclass(frozen=True)
class BudgetStatus:
    scope_id: str

    budget: Decimal
    spent: Decimal
    reserved: Decimal
    available: Decimal

    utilization_percent: Decimal

    request_count: int
    token_count: int

    currency: str


class BudgetManager:
    """
    Central ModelNow budget lifecycle manager.

    Responsibilities:

        1. Create budgets
        2. Update budgets
        3. Allocate budgets
        4. Reserve budget
        5. Commit actual spend
        6. Release unused reservations
        7. Track utilization
        8. Maintain budget history

    Enforcement decisions should remain in budget_enforcer.
    """

    def __init__(self) -> None:

        self.allocator = BudgetAllocator()
        self.tracker = BudgetTracker()
        self.history = BudgetHistory()

        self._configs: dict[str, BudgetConfig] = {}

    # ---------------------------------------------------------
    # CREATE
    # ---------------------------------------------------------

    def create_budget(
        self,
        scope_id: str,
        amount: Decimal,
        currency: str = "USD",
        daily_limit: Decimal | None = None,
        monthly_limit: Decimal | None = None,
    ) -> BudgetConfig:

        if not scope_id:
            raise ValueError("scope_id is required.")

        amount = money(amount)

        if amount < 0:
            raise ValueError("Budget amount cannot be negative.")

        if daily_limit is not None:
            daily_limit = money(daily_limit)

        if monthly_limit is not None:
            monthly_limit = money(monthly_limit)

        config = BudgetConfig(
            scope_id=scope_id,
            amount=amount,
            currency=currency,
            daily_limit=daily_limit,
            monthly_limit=monthly_limit,
        )

        self._configs[scope_id] = config

        self.tracker.create(
            scope_id=scope_id,
            budget=amount,
        )

        self.history.record(
            scope_id=scope_id,
            event_type="budget_created",
            amount=amount,
        )

        return config

    # ---------------------------------------------------------
    # UPDATE
    # ---------------------------------------------------------

    def update_budget(
        self,
        scope_id: str,
        amount: Decimal,
    ) -> BudgetConfig:

        config = self._require_config(scope_id)

        amount = money(amount)

        if amount < 0:
            raise ValueError("Budget amount cannot be negative.")

        new_config = BudgetConfig(
            scope_id=config.scope_id,
            amount=amount,
            currency=config.currency,
            daily_limit=config.daily_limit,
            monthly_limit=config.monthly_limit,
        )

        self._configs[scope_id] = new_config

        usage = self.tracker.get(scope_id)

        if usage:
            usage.budget = amount

        self.history.record(
            scope_id=scope_id,
            event_type="budget_updated",
            amount=amount,
        )

        return new_config

    # ---------------------------------------------------------
    # ALLOCATION
    # ---------------------------------------------------------

    def allocate(
        self,
        parent_scope_id: str,
        child_scope_id: str,
        amount: Decimal,
    ):

        parent = self._require_config(parent_scope_id)

        amount = money(amount)

        existing = self.allocator.total_allocated()

        if existing + amount > parent.amount:
            raise ValueError(
                f"Allocation exceeds parent budget. "
                f"Budget={parent.amount}, "
                f"already_allocated={existing}, "
                f"requested={amount}"
            )

        allocation = self.allocator.allocate(
            scope_id=child_scope_id,
            amount=amount,
            currency=parent.currency,
        )

        if self.tracker.get(child_scope_id) is None:
            self.tracker.create(
                scope_id=child_scope_id,
                budget=amount,
            )

        self.history.record(
            scope_id=child_scope_id,
            event_type="budget_allocated",
            amount=amount,
            metadata={
                "parent_scope_id": parent_scope_id,
            },
        )

        return allocation

    # ---------------------------------------------------------
    # RESERVE
    # ---------------------------------------------------------

    def reserve(
        self,
        scope_id: str,
        estimated_cost: Decimal,
        request_id: str | None = None,
    ) -> None:

        estimated_cost = money(estimated_cost)

        self.tracker.reserve(
            scope_id=scope_id,
            amount=estimated_cost,
        )

        self.history.record(
            scope_id=scope_id,
            event_type="budget_reserved",
            amount=estimated_cost,
            request_id=request_id,
        )

    # ---------------------------------------------------------
    # COMMIT
    # ---------------------------------------------------------

    def commit(
        self,
        scope_id: str,
        actual_cost: Decimal,
        tokens: int = 0,
        request_id: str | None = None,
        model: str | None = None,
    ):

        actual_cost = money(actual_cost)

        usage = self.tracker.record_spend(
            scope_id=scope_id,
            amount=actual_cost,
            tokens=tokens,
        )

        self.history.record(
            scope_id=scope_id,
            event_type="spend_committed",
            amount=actual_cost,
            request_id=request_id,
            model=model,
            metadata={
                "tokens": tokens,
            },
        )

        return usage

    # ---------------------------------------------------------
    # RELEASE
    # ---------------------------------------------------------

    def release(
        self,
        scope_id: str,
        reserved_amount: Decimal,
        request_id: str | None = None,
    ):

        reserved_amount = money(reserved_amount)

        usage = self.tracker.release(
            scope_id=scope_id,
            amount=reserved_amount,
        )

        self.history.record(
            scope_id=scope_id,
            event_type="budget_released",
            amount=reserved_amount,
            request_id=request_id,
        )

        return usage

    # ---------------------------------------------------------
    # STATUS
    # ---------------------------------------------------------

    def status(
        self,
        scope_id: str,
    ) -> BudgetStatus:

        config = self._require_config(scope_id)
        usage = self.tracker.get(scope_id)

        if usage is None:
            raise KeyError(
                f"No tracker exists for {scope_id}"
            )

        return BudgetStatus(
            scope_id=scope_id,
            budget=usage.budget,
            spent=usage.spent,
            reserved=usage.reserved,
            available=remaining(
                usage.budget,
                usage.spent,
                usage.reserved,
            ),
            utilization_percent=utilization(
                usage.spent + usage.reserved,
                usage.budget,
            ),
            request_count=usage.request_count,
            token_count=usage.token_count,
            currency=config.currency,
        )

    # ---------------------------------------------------------
    # HISTORY
    # ---------------------------------------------------------

    def history_for(
        self,
        scope_id: str,
    ):

        return self.history.get(scope_id)

    # ---------------------------------------------------------
    # INTERNAL
    # ---------------------------------------------------------

    def _require_config(
        self,
        scope_id: str,
    ) -> BudgetConfig:

        config = self._configs.get(scope_id)

        if config is None:
            raise KeyError(
                f"No budget configured for {scope_id}"
            )

        return config