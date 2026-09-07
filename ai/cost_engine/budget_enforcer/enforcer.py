from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Optional

from .actions import ActionResolver, EnforcementAction
from .limits import BudgetLimit, BudgetStore
from .policies import BudgetAction, BudgetPolicy
from .validator import BudgetValidationResult, BudgetValidator


class BudgetExceededError(Exception):
    pass


class BudgetApprovalRequired(Exception):
    pass


@dataclass(frozen=True)
class EnforcementRequest:
    tenant_id: str

    estimated_cost: Decimal
    estimated_tokens: int

    project_id: Optional[str] = None
    user_id: Optional[str] = None
    agent_id: Optional[str] = None
    workflow_id: Optional[str] = None

    model: Optional[str] = None


@dataclass(frozen=True)
class EnforcementResult:
    allowed: bool
    action: BudgetAction

    scope_id: str
    estimated_cost: Decimal

    validation: BudgetValidationResult
    enforcement: EnforcementAction


class BudgetEnforcer:
    """
    ModelNow hard budget gate.

    It should be called BEFORE an expensive inference/tool operation.

    Example:

        result = enforcer.check(request)

        if result.action == BudgetAction.SWITCH_MODEL:
            model = result.enforcement.recommended_model

        elif not result.allowed:
            raise BudgetExceededError(result.enforcement.reason)

        reservation = enforcer.reserve(request)
        ...
        enforcer.commit(request, actual_cost)
    """

    def __init__(
        self,
        store: BudgetStore,
        validator: Optional[BudgetValidator] = None,
        resolver: Optional[ActionResolver] = None,
    ) -> None:

        self.store = store
        self.validator = validator or BudgetValidator()
        self.resolver = resolver or ActionResolver()

    def check(
        self,
        request: EnforcementRequest,
        policy: BudgetPolicy,
    ) -> EnforcementResult:

        scopes = self._build_scopes(request)

        # Most specific scope wins.
        for scope_id in scopes:

            limit = self.store.get_limit(scope_id)

            if limit is None:
                continue

            spend = self.store.get_spend(scope_id)

            validation = self.validator.validate(
                limit=limit,
                spend=spend,
                estimated_cost=request.estimated_cost,
                estimated_tokens=request.estimated_tokens,
            )

            action = self.resolver.resolve(
                soft_limit_reached=validation.soft_limit_reached,
                hard_limit_reached=validation.hard_limit_reached,
                policy=policy,
                estimated_cost=request.estimated_cost,
            )

            return EnforcementResult(
                allowed=action.allowed,
                action=action.action,
                scope_id=scope_id,
                estimated_cost=request.estimated_cost,
                validation=validation,
                enforcement=action,
            )

        # No budget configured.
        return EnforcementResult(
            allowed=True,
            action=BudgetAction.CONTINUE,
            scope_id=request.tenant_id,
            estimated_cost=request.estimated_cost,
            validation=BudgetValidationResult(
                allowed=True,
                soft_limit_reached=False,
                hard_limit_reached=False,
                daily_remaining=Decimal("0"),
                monthly_remaining=Decimal("0"),
                reason="no_budget_configured",
            ),
            enforcement=EnforcementAction(
                action=BudgetAction.CONTINUE,
                allowed=True,
                reason="no_budget_configured",
                estimated_cost=request.estimated_cost,
            ),
        )

    def enforce(
        self,
        request: EnforcementRequest,
        policy: BudgetPolicy,
    ) -> EnforcementResult:

        result = self.check(request, policy)

        if not result.allowed:

            if result.action == BudgetAction.REQUIRE_APPROVAL:
                raise BudgetApprovalRequired(
                    result.enforcement.reason
                )

            if result.action == BudgetAction.BLOCK:
                raise BudgetExceededError(
                    result.enforcement.reason
                )

        return result

    def reserve(
        self,
        request: EnforcementRequest,
    ) -> None:

        scopes = self._build_scopes(request)

        for scope_id in scopes:

            if self.store.get_limit(scope_id):
                self.store.reserve(
                    scope_id,
                    request.estimated_cost,
                )

    def commit(
        self,
        request: EnforcementRequest,
        actual_cost: Decimal,
    ) -> None:

        if actual_cost < 0:
            raise ValueError("actual_cost cannot be negative")

        scopes = self._build_scopes(request)

        for scope_id in scopes:

            if self.store.get_limit(scope_id):
                self.store.commit(
                    scope_id,
                    actual_cost,
                )

    def release(
        self,
        request: EnforcementRequest,
    ) -> None:

        scopes = self._build_scopes(request)

        for scope_id in scopes:

            if self.store.get_limit(scope_id):
                self.store.release(
                    scope_id,
                    request.estimated_cost,
                )

    @staticmethod
    def _build_scopes(
        request: EnforcementRequest,
    ) -> list[str]:

        scopes = []

        # Most specific → least specific.
        if request.workflow_id:
            scopes.append(f"workflow:{request.workflow_id}")

        if request.agent_id:
            scopes.append(f"agent:{request.agent_id}")

        if request.user_id:
            scopes.append(f"user:{request.user_id}")

        if request.project_id:
            scopes.append(f"project:{request.project_id}")

        scopes.append(f"tenant:{request.tenant_id}")

        return scopes