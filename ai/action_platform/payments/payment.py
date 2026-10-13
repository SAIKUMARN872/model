"""Payment request and transaction models for ModelNow."""

from dataclasses import dataclass, field
from decimal import Decimal, InvalidOperation
from enum import Enum
from typing import Any


class PaymentStatus(str, Enum):
    PENDING = "pending"
    AWAITING_APPROVAL = "awaiting_approval"
    PROCESSING = "processing"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELLED = "cancelled"
    UNKNOWN = "unknown"


@dataclass(frozen=True)
class PaymentRequest:
    """A request to initiate a payment through a trusted provider."""

    amount: Decimal
    currency: str
    order_id: str
    payment_id: str = ""
    provider: str = ""
    requires_approval: bool = True
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        try:
            amount = Decimal(str(self.amount))
        except (InvalidOperation, ValueError, TypeError):
            raise ValueError("Payment amount must be a valid decimal.") from None

        if not amount.is_finite() or amount <= 0:
            raise ValueError("Payment amount must be positive and finite.")

        object.__setattr__(self, "amount", amount)

        if not isinstance(self.currency, str) or len(self.currency) != 3:
            raise ValueError("Currency must be a three-letter code.")
        if not self.currency.isalpha() or not self.currency.isascii():
            raise ValueError("Currency must contain ASCII letters only.")

        if not isinstance(self.order_id, str) or not self.order_id.strip():
            raise ValueError("order_id must not be empty.")
        if not isinstance(self.payment_id, str) or len(self.payment_id) > 200:
            raise ValueError("payment_id must be a string of at most 200 characters.")
        if not isinstance(self.provider, str) or len(self.provider) > 100:
            raise ValueError("provider must be a string of at most 100 characters.")
        if not isinstance(self.requires_approval, bool):
            raise ValueError("requires_approval must be a boolean.")
        if not isinstance(self.metadata, dict):
            raise ValueError("metadata must be a dictionary.")
        if not all(isinstance(key, str) for key in self.metadata):
            raise ValueError("metadata keys must be strings.")


@dataclass(frozen=True)
class PaymentResult:
    """A normalized payment-provider result."""

    payment_id: str
    order_id: str
    status: PaymentStatus
    amount: Decimal
    currency: str
    provider_reference: str | None = None
    error: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "payment_id": self.payment_id,
            "order_id": self.order_id,
            "status": self.status.value,
            "amount": format(self.amount, "f"),
            "currency": self.currency,
            "provider_reference": self.provider_reference,
            "error": self.error,
        }
