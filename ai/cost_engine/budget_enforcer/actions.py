from dataclasses import dataclass

@dataclass(frozen=True)
class BudgetAction:
    name: str
    description: str
    enabled: bool = True


DEFAULT_ACTIONS = (
    BudgetAction("downgrade_model", "Prefer a lower-cost capable model."),
    BudgetAction("limit_tokens", "Reduce maximum output tokens."),
    BudgetAction("reject_request", "Reject requests exceeding the configured budget."),
)
