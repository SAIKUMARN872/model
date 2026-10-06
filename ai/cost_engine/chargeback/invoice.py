from dataclasses import dataclass
from datetime import datetime, timezone

@dataclass(frozen=True)
class Invoice:
    invoice_id: str
    customer_id: str
    amount: float
    currency: str = "USD"
    issued_at: str = ""

    def __post_init__(self):
        if self.amount < 0:
            raise ValueError("amount cannot be negative.")
        if not self.issued_at:
            object.__setattr__(self, "issued_at", datetime.now(timezone.utc).isoformat())
