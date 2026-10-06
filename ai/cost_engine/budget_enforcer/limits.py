from dataclasses import dataclass

@dataclass(frozen=True)
class BudgetLimit:
    maximum_cost: float
    currency: str = "USD"
    period: str = "request"

    def allows(self, cost: float) -> bool:
        return cost <= self.maximum_cost
