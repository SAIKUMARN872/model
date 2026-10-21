from decimal import Decimal

from ..budget_manager.manager import BudgetManager
from .enforcer import BudgetEnforcer
from .exceptions import (
    BudgetExceededError,
    BudgetNotFoundError,
    InvalidBudgetRequestError,
)
from .models import EnforcementAction


def run_test() -> None:
    manager = BudgetManager()

    manager.create_budget(
        budget_id="test-budget",
        limit=Decimal("100"),
        currency="USD",
    )

    enforcer = BudgetEnforcer(manager)

    allowed = enforcer.check(
        budget_id="test-budget",
        requested_cost=Decimal("20"),
    )

    assert allowed.action == EnforcementAction.ALLOW
    assert allowed.spent == Decimal("0")
    assert allowed.remaining == Decimal("80")
    assert allowed.exceeded is False
    assert allowed.warning is False

    manager.record_spend(
        budget_id="test-budget",
        amount=Decimal("75"),
    )

    warning = enforcer.check(
        budget_id="test-budget",
        requested_cost=Decimal("10"),
    )

    assert warning.action == EnforcementAction.WARN
    assert warning.spent == Decimal("75")
    assert warning.remaining == Decimal("15")
    assert warning.warning is True
    assert warning.exceeded is False

    blocked = enforcer.check(
        budget_id="test-budget",
        requested_cost=Decimal("30"),
    )

    assert blocked.action == EnforcementAction.BLOCK
    assert blocked.exceeded is True

    enforced = enforcer.enforce(
        budget_id="test-budget",
        requested_cost=Decimal("10"),
    )

    assert enforced.action == EnforcementAction.WARN

    assert enforcer.authorize(
        budget_id="test-budget",
        requested_cost=Decimal("5"),
    ) is True

    try:
        enforcer.enforce(
            budget_id="test-budget",
            requested_cost=Decimal("30"),
        )
    except BudgetExceededError:
        pass
    else:
        raise AssertionError(
            "Exceeded budget should raise BudgetExceededError"
        )

    try:
        enforcer.check(
            budget_id="missing-budget",
            requested_cost=Decimal("10"),
        )
    except BudgetNotFoundError:
        pass
    else:
        raise AssertionError(
            "Missing budget should raise BudgetNotFoundError"
        )

    try:
        enforcer.check(
            budget_id="test-budget",
            requested_cost=Decimal("-1"),
        )
    except InvalidBudgetRequestError:
        pass
    else:
        raise AssertionError(
            "Negative request cost should be rejected"
        )

    print("BUDGET ALLOW: PASS")
    print("BUDGET WARNING: PASS")
    print("BUDGET BLOCK: PASS")
    print("BUDGET ENFORCEMENT: PASS")
    print("BUDGET AUTHORIZATION: PASS")
    print("MISSING BUDGET HANDLING: PASS")
    print("INVALID REQUEST HANDLING: PASS")
    print("BUDGET ENFORCER: PASS")


if __name__ == "__main__":
    run_test()
