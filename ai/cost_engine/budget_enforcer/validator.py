from .limits import BudgetLimit

def validate_budget_limit(limit: BudgetLimit) -> None:
    if limit.maximum_cost < 0:
        raise ValueError("maximum_cost cannot be negative.")
    if not limit.currency.strip():
        raise ValueError("currency cannot be empty.")
    if not limit.period.strip():
        raise ValueError("period cannot be empty.")


def validate_cost(cost: float) -> None:
    if cost < 0:
        raise ValueError("cost cannot be negative.")
