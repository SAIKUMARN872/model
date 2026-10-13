"""Payment result verification for ModelNow."""

from dataclasses import dataclass
from decimal import Decimal
from typing import Any

from .payment import PaymentRequest, PaymentResult, PaymentStatus


@dataclass(frozen=True)
class PaymentVerification:
    payment_id: str
    order_id: str
    verified: bool
    status: PaymentStatus
    provider_reference: str | None = None
    issues: tuple[str, ...] = ()

    def to_dict(self) -> dict[str, Any]:
        return {
            "payment_id": self.payment_id,
            "order_id": self.order_id,
            "verified": self.verified,
            "status": self.status.value,
            "provider_reference": self.provider_reference,
            "issues": list(self.issues),
        }


def verify_payment_result(
    request: PaymentRequest,
    result: PaymentResult,
    *,
    expected_provider_reference: str | None = None,
) -> PaymentVerification:
    """Check result consistency; this does not authenticate a provider.

    For production verification, obtain payment status directly from a trusted
    provider API or validate its authenticated webhook before calling this
    function. A provider reference alone is not cryptographic proof of payment.
    """
    if not isinstance(request, PaymentRequest):
        raise TypeError("request must be a PaymentRequest.")
    if not isinstance(result, PaymentResult):
        raise TypeError("result must be a PaymentResult.")

    issues: list[str] = []

    if result.payment_id != request.payment_id:
        issues.append("Payment ID does not match the request.")
    if result.order_id != request.order_id:
        issues.append("Order ID does not match the request.")

    try:
        result_amount = Decimal(str(result.amount))
    except Exception:
        result_amount = Decimal("NaN")

    if not result_amount.is_finite() or result_amount != request.amount:
        issues.append("Payment amount does not match the request.")

    if result.currency.upper() != request.currency.upper():
        issues.append("Payment currency does not match the request.")

    if result.status != PaymentStatus.SUCCEEDED:
        issues.append("Payment status is not succeeded.")

    if not isinstance(result.provider_reference, str) or not result.provider_reference.strip():
        issues.append("A provider reference is required.")

    if expected_provider_reference is not None:
        if (
            not isinstance(expected_provider_reference, str)
            or result.provider_reference != expected_provider_reference
        ):
            issues.append("Provider reference does not match the expected reference.")

    return PaymentVerification(
        payment_id=request.payment_id,
        order_id=request.order_id,
        verified=not issues,
        status=result.status,
        provider_reference=result.provider_reference,
        issues=tuple(issues),
    )
