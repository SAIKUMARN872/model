from decimal import Decimal

from .manager import BudgetManager


def run_test() -> None:
    manager = BudgetManager()

    budget = manager.create_budget(
        budget_id="enterprise-monthly",
        limit=Decimal("100"),
        currency="USD",
        owner_id="enterprise-001",
        period="monthly",
    )

    assert budget.limit == Decimal("100")
    assert budget.spent == Decimal("0")

    allocation = manager.allocate(
        budget_id="enterprise-monthly",
        amount=Decimal("50"),
        source="cost_engine",
    )

    assert allocation.amount == Decimal("50")

    spend = manager.record_spend(
        budget_id="enterprise-monthly",
        amount=Decimal("12.50"),
        request_id="req-001",
        model="test-model",
        provider="test-provider",
    )

    assert spend.amount == Decimal("12.50")

    assert manager.get_spent(
        "enterprise-monthly"
    ) == Decimal("12.50")

    assert manager.get_remaining(
        "enterprise-monthly"
    ) == Decimal("87.50")

    utilization = manager.get_utilization(
        "enterprise-monthly"
    )

    assert utilization == Decimal("0.125")

    history = manager.list_history(
        budget_id="enterprise-monthly"
    )

    assert len(history) == 3
    assert history[0].event_type == "created"
    assert history[1].event_type == "allocation"
    assert history[2].event_type == "spend"

    snapshot = manager.snapshot(
        "enterprise-monthly"
    )

    assert snapshot["limit"] == Decimal("100")
    assert snapshot["spent"] == Decimal("12.50")
    assert snapshot["remaining"] == Decimal("87.50")
    assert snapshot["exceeded"] is False

    try:
        manager.record_spend(
            budget_id="enterprise-monthly",
            amount=Decimal("100"),
        )
    except ValueError:
        pass
    else:
        raise AssertionError(
            "Budget over-spending should be rejected"
        )

    try:
        manager.create_budget(
            budget_id="invalid-budget",
            limit=Decimal("0"),
        )
    except ValueError:
        pass
    else:
        raise AssertionError(
            "Zero budget limit should be rejected"
        )

    print("BUDGET CREATION: PASS")
    print("BUDGET ALLOCATION: PASS")
    print("BUDGET SPENDING: PASS")
    print("BUDGET TRACKING: PASS")
    print("BUDGET HISTORY: PASS")
    print("BUDGET SNAPSHOT: PASS")
    print("OVER-SPEND PROTECTION: PASS")
    print("BUDGET MANAGER: PASS")


if __name__ == "__main__":
    run_test()
