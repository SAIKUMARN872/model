from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Dict


class AllocationError(Exception):
    pass


@dataclass(frozen=True)
class BudgetAllocation:
    scope_id: str
    amount: Decimal
    currency: str = "USD"


class BudgetAllocator:
    """
    Allocates a parent budget across child scopes.

    Example:
        Tenant = $10,000
        ├── Project A = $4,000
        ├── Project B = $3,000
        └── Project C = $3,000
    """

    def __init__(self) -> None:
        self._allocations: Dict[str, BudgetAllocation] = {}

    def allocate(
        self,
        scope_id: str,
        amount: Decimal,
        currency: str = "USD",
    ) -> BudgetAllocation:

        if amount <= 0:
            raise AllocationError(
                "Allocation amount must be greater than zero."
            )

        allocation = BudgetAllocation(
            scope_id=scope_id,
            amount=amount,
            currency=currency,
        )

        self._allocations[scope_id] = allocation
        return allocation

    def get(self, scope_id: str) -> BudgetAllocation | None:
        return self._allocations.get(scope_id)

    def remove(self, scope_id: str) -> None:
        self._allocations.pop(scope_id, None)

    def total_allocated(self) -> Decimal:
        return sum(
            allocation.amount
            for allocation in self._allocations.values()
        )

    def all_allocations(self) -> list[BudgetAllocation]:
        return list(self._allocations.values())