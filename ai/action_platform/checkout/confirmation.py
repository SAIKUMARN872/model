"""Order confirmation contracts for ModelNow checkout."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class CheckoutConfirmation:
    """Validated result of checking a provider order confirmation."""

    confirmed: bool
    status: str
    order_id: str | None = None
    provider: str | None = None
    issues: tuple[str, ...] = field(default_factory=tuple)

    def to_dict(self) -> dict[str, Any]:
        return {
            "confirmed": self.confirmed,
            "status": self.status,
            "order_id": self.order_id,
            "provider": self.provider,
            "issues": list(self.issues),
        }


class CheckoutConfirmationVerifier:
    """Validates the structure of an order confirmation response."""

    SUCCESS_STATUSES = {"confirmed", "placed", "success", "succeeded"}
    PENDING_STATUSES = {"pending", "processing", "awaiting_confirmation"}
    FAILURE_STATUSES = {"failed", "cancelled", "canceled", "rejected"}

    def verify(self, response: Any) -> CheckoutConfirmation:
        if not isinstance(response, dict):
            return CheckoutConfirmation(
                confirmed=False,
                status="unverified",
                issues=("Provider response must be a dictionary.",),
            )

        raw_status = response.get("status")
        if not isinstance(raw_status, str) or not raw_status.strip():
            return CheckoutConfirmation(
                confirmed=False,
                status="unverified",
                issues=("Provider response is missing a status.",),
            )

        status = raw_status.strip().lower()

        if status in self.PENDING_STATUSES:
            return CheckoutConfirmation(
                confirmed=False,
                status="pending",
                issues=("The provider has not confirmed the order yet.",),
            )

        if status in self.FAILURE_STATUSES:
            return CheckoutConfirmation(
                confirmed=False,
                status="failed",
                issues=(f"Provider order status is '{status}'.",),
            )

        if status not in self.SUCCESS_STATUSES:
            return CheckoutConfirmation(
                confirmed=False,
                status="unverified",
                issues=(f"Unrecognized order status: '{status}'.",),
            )

        order_id = response.get("provider_order_id")
        if not isinstance(order_id, str) or not order_id.strip():
            return CheckoutConfirmation(
                confirmed=False,
                status="unverified",
                issues=("A provider_order_id is required.",),
            )

        provider = response.get("provider")
        if provider is not None and (
            not isinstance(provider, str) or not provider.strip()
        ):
            return CheckoutConfirmation(
                confirmed=False,
                status="unverified",
                issues=("Provider must be a non-empty string when supplied.",),
            )

        return CheckoutConfirmation(
            confirmed=True,
            status="confirmed",
            order_id=order_id.strip(),
            provider=provider.strip() if isinstance(provider, str) else None,
        )


def verify_checkout_confirmation(response: Any) -> CheckoutConfirmation:
    """Convenience function for verifying an order response."""
    return CheckoutConfirmationVerifier().verify(response)
