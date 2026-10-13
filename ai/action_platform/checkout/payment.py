"""Payment contracts for ModelNow checkout."""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from typing import Any, Protocol, runtime_checkable


@dataclass(frozen=True)
class PaymentRequest:
    """Validated intent to request payment from a provider."""

    task_id: str
    amount: str
    currency: str = "INR"
    idempotency_key: str = ""

    def __post_init__(self) -> None:
        if not isinstance(self.task_id, str) or not self.task_id.strip():
            raise ValueError("A non-empty task_id is required.")
        if not isinstance(self.amount, str):
            raise TypeError("amount must be a decimal string.")

        try:
            value = Decimal(self.amount)
        except (InvalidOperation, ValueError):
            raise ValueError("amount must be a valid decimal number.") from None

        if not value.is_finite() or value <= 0:
            raise ValueError("amount must be greater than zero.")

        if not isinstance(self.currency, str):
            raise TypeError("currency must be a string.")
        currency = self.currency.strip().upper()
        if len(currency) != 3 or not currency.isalpha():
            raise ValueError("currency must be a three-letter currency code.")

        if not isinstance(self.idempotency_key, str):
            raise TypeError("idempotency_key must be a string.")

        object.__setattr__(self, "task_id", self.task_id.strip())
        object.__setattr__(
            self, "amount", format(value.quantize(Decimal("0.01")), ".2f")
        )
        object.__setattr__(self, "currency", currency)
        object.__setattr__(self, "idempotency_key", self.idempotency_key.strip())

    def to_dict(self) -> dict[str, Any]:
        return {
            "task_id": self.task_id,
            "amount": self.amount,
            "currency": self.currency,
            "idempotency_key": self.idempotency_key,
        }


@dataclass(frozen=True)
class PaymentResult:
    """Normalized payment outcome returned by a payment adapter."""

    task_id: str
    status: str
    transaction_id: str | None = None
    provider: str | None = None
    error: str | None = None

    @property
    def succeeded(self) -> bool:
        return self.status == "succeeded" and bool(self.transaction_id)

    def to_dict(self) -> dict[str, Any]:
        return {
            "task_id": self.task_id,
            "status": self.status,
            "transaction_id": self.transaction_id,
            "provider": self.provider,
            "succeeded": self.succeeded,
            "error": self.error,
        }


@runtime_checkable
class PaymentProvider(Protocol):
    """Interface implemented by a real payment-provider adapter."""

    async def authorize_and_charge(
        self,
        request: PaymentRequest,
    ) -> dict[str, Any]:
        """Execute provider-side authorization and payment processing."""
        ...


class PaymentGateway:
    """Safe provider boundary; no provider means no payment execution."""

    def __init__(self, provider: PaymentProvider | None = None) -> None:
        self._provider = provider

    async def pay(self, request: PaymentRequest) -> PaymentResult:
        if self._provider is None:
            return PaymentResult(
                task_id=request.task_id,
                status="not_configured",
                error="No payment provider is configured; no payment was attempted.",
            )

        return PaymentResult(
            task_id=request.task_id,
            status="not_executed",
            error=(
                "Payment execution is not enabled by this contract-only gateway. "
                "A trusted authorization, idempotency enforcement, and provider "
                "response verification must be implemented before charging."
            ),
        )
