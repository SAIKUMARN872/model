from dataclasses import dataclass
from typing import Optional

@dataclass(frozen=True)
class ChargebackRecord:
    organization_id: str
    amount: float
    currency: str = "USD"
    project_id: Optional[str] = None
    model: Optional[str] = None

    def __post_init__(self):
        if self.amount < 0:
            raise ValueError("amount cannot be negative.")
