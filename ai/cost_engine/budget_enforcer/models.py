from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from enum import Enum


class EnforcementAction(str, Enum):
    ALLOW = "allow"
    WARN = "warn"
    BLOCK = "block"


@dataclass(frozen=True)
class BudgetCheck:
    budget_id: str
    limit: Decimal
    spent: Decimal
    requested_cost: Decimal
    remaining: Decimal
    utilization: Decimal
    action: EnforcementAction
    exceeded: bool
    warning: bool


__all__ = [
    "EnforcementAction",
    "BudgetCheck",
]
