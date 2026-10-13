"""Cross-check checkout, order confirmation, and payment results."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class CheckoutVerification:
    """Outcome of consistency checks across checkout artifacts."""

    verified: bool
    status: str
    task_id: str
    order_id: str | None = None
    transaction_id: str | None = None
    issues: tuple[str, ...] = field(default_factory=tuple)

    def to_dict(self) -> dict[str, Any]:
        return {
            "verified": self.verified,
            "status": self.status,
            "task_id": self.task_id,
            "order_id": self.order_id,
            "transaction_id": self.transaction_id,
            "issues": list(self.issues),
        }


class CheckoutVerifier:
    """Checks that order and payment records are consistent."""

    def verify(
        self,
        task_id: str,
        confirmation: Any,
        payment: Any,
    ) -> CheckoutVerification:
        issues: list[str] = []

        if not isinstance(task_id, str) or not task_id.strip():
            issues.append("A non-empty task_id is required.")

        if not isinstance(confirmation, dict):
            issues.append("Order confirmation must be a dictionary.")
            confirmation = {}

        if not isinstance(payment, dict):
            issues.append("Payment result must be a dictionary.")
            payment = {}

        order_status = confirmation.get("status")
        order_id = confirmation.get("provider_order_id")
        if order_status not in {"confirmed", "placed", "success", "succeeded"}:
            issues.append("Order is not confirmed by the provider.")
        if not isinstance(order_id, str) or not order_id.strip():
            issues.append("Provider order ID is missing.")

        payment_status = payment.get("status")
        transaction_id = payment.get("transaction_id")
        if payment_status != "succeeded":
            issues.append("Payment is not marked as succeeded by the provider.")
        if not isinstance(transaction_id, str) or not transaction_id.strip():
            issues.append("Payment transaction ID is missing.")

        confirmation_task = confirmation.get("task_id")
        payment_task = payment.get("task_id")
        if confirmation_task is not None and confirmation_task != task_id:
            issues.append("Order confirmation task ID does not match.")
        if payment_task is not None and payment_task != task_id:
            issues.append("Payment task ID does not match.")

        if issues:
            return CheckoutVerification(
                verified=False,
                status="unverified",
                task_id=task_id.strip() if isinstance(task_id, str) else "",
                order_id=order_id if isinstance(order_id, str) else None,
                transaction_id=(
                    transaction_id if isinstance(transaction_id, str) else None
                ),
                issues=tuple(issues),
            )

        return CheckoutVerification(
            verified=True,
            status="verified",
            task_id=task_id.strip(),
            order_id=order_id.strip(),
            transaction_id=transaction_id.strip(),
        )


def verify_checkout(
    task_id: str,
    confirmation: Any,
    payment: Any,
) -> CheckoutVerification:
    """Convenience function for cross-checking checkout artifacts."""
    return CheckoutVerifier().verify(task_id, confirmation, payment)
