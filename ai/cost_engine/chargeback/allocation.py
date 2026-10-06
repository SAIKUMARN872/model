from dataclasses import dataclass

@dataclass(frozen=True)
class ChargeAllocation:
    organization_id: str
    project_id: Optional[str]
    amount: float
    currency: str = "USD"

    def __post_init__(self):
        if self.amount < 0:
            raise ValueError("amount cannot be negative.")
