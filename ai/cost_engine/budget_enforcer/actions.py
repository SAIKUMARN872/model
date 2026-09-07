from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Optional, Tuple

from .policies import BudgetAction


@dataclass(frozen=True)
class EnforcementAction:
    action: BudgetAction
    allowed: bool

    reason: str

    recommended_model: Optional[str] = None

    requires_approval: bool = False
    estimated_cost: Decimal = Decimal("0")

    metadata: Tuple[Tuple[str, str], ...] = ()


class ActionResolver:
    def resolve(
        self,
        *,
        soft_limit_reached: bool,
        hard_limit_reached: bool,
        policy,
        estimated_cost: Decimal,
    ) -> EnforcementAction:

        if hard_limit_reached:

            if policy.enable_model_downgrade and policy.fallback_models:
                return EnforcementAction(
                    action=BudgetAction.SWITCH_MODEL,
                    allowed=True,
                    reason="budget_hard_limit_requires_cheaper_model",
                    recommended_model=policy.fallback_models[0],
                    estimated_cost=estimated_cost,
                )

            if (
                policy.require_approval_for_overage
                and policy.on_hard_limit
                == BudgetAction.REQUIRE_APPROVAL
            ):
                return EnforcementAction(
                    action=BudgetAction.REQUIRE_APPROVAL,
                    allowed=False,
                    reason="budget_hard_limit_requires_approval",
                    requires_approval=True,
                    estimated_cost=estimated_cost,
                )

            if (
                policy.enable_request_defer
                and policy.on_hard_limit == BudgetAction.QUEUE
            ):
                return EnforcementAction(
                    action=BudgetAction.QUEUE,
                    allowed=False,
                    reason="budget_hard_limit_request_deferred",
                    estimated_cost=estimated_cost,
                )

            return EnforcementAction(
                action=BudgetAction.BLOCK,
                allowed=False,
                reason="budget_hard_limit_reached",
                estimated_cost=estimated_cost,
            )

        if soft_limit_reached:

            if policy.enable_model_downgrade and policy.fallback_models:
                return EnforcementAction(
                    action=BudgetAction.SWITCH_MODEL,
                    allowed=True,
                    reason="budget_soft_limit_use_optimized_model",
                    recommended_model=policy.fallback_models[0],
                    estimated_cost=estimated_cost,
                )

            if policy.on_soft_limit == BudgetAction.REQUIRE_APPROVAL:
                return EnforcementAction(
                    action=BudgetAction.REQUIRE_APPROVAL,
                    allowed=False,
                    reason="budget_soft_limit_requires_approval",
                    requires_approval=True,
                    estimated_cost=estimated_cost,
                )

            if policy.on_soft_limit == BudgetAction.QUEUE:
                return EnforcementAction(
                    action=BudgetAction.QUEUE,
                    allowed=False,
                    reason="budget_soft_limit_request_deferred",
                    estimated_cost=estimated_cost,
                )

            return EnforcementAction(
                action=BudgetAction.WARN,
                allowed=True,
                reason="budget_soft_limit_reached",
                estimated_cost=estimated_cost,
            )

        return EnforcementAction(
            action=BudgetAction.CONTINUE,
            allowed=True,
            reason="within_budget",
            estimated_cost=estimated_cost,
        )