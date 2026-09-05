from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Tuple


class BudgetDecision(str, Enum):
    ALLOW = "allow"
    WARN = "warn"
    DOWNGRADE = "downgrade"
    APPROVAL_REQUIRED = "approval_required"
    DEFER = "defer"
    BLOCK = "block"


class BudgetAction(str, Enum):
    CONTINUE = "continue"
    WARN = "warn"
    SWITCH_MODEL = "switch_model"
    REQUIRE_APPROVAL = "require_approval"
    QUEUE = "queue"
    BLOCK = "block"


@dataclass(frozen=True)
class BudgetPolicy:
    """
    Determines what ModelNow does when a budget threshold is reached.
    """

    name: str = "default"

    on_soft_limit: BudgetAction = BudgetAction.WARN
    on_hard_limit: BudgetAction = BudgetAction.BLOCK

    enable_model_downgrade: bool = True
    enable_request_defer: bool = True
    require_approval_for_overage: bool = True

    fallback_models: Tuple[str, ...] = ()

    allow_zero_budget_requests: bool = False