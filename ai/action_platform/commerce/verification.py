"""Verification of commerce order confirmations for ModelNow."""

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class CommerceVerification:
    verified: bool
    status: str
    task_id: str
    order_id: str | None = None
    issues: tuple[str, ...] = field(default_factory=tuple)

    def to_dict(self) -> dict[str, Any]:
        return {
            "verified": self.verified,
            "status": self.status,
            "task_id": self.task_id,
            "order_id": self.order_id,
            "issues": list(self.issues),
        }


class CommerceVerifier:
    """Check supplied provider evidence without assuming it is authentic.

    The caller must obtain evidence from a trusted provider integration.
    This verifier validates its structure and consistency; it does not
    independently contact a merchant or authenticate provider responses.
    """

    SUCCESS_STATUSES = {"confirmed", "placed", "success", "succeeded"}
    PENDING_STATUSES = {"pending", "processing", "awaiting_confirmation"}
    FAILURE_STATUSES = {"failed", "cancelled", "canceled", "rejected"}

    def verify(
        self,
        task_id: str,
        confirmation: dict[str, Any],
    ) -> CommerceVerification:
        issues: list[str] = []

        if not isinstance(task_id, str) or not task_id.strip():
            return CommerceVerification(
                verified=False,
                status="unverified",
                task_id="",
                issues=("A non-empty task_id is required.",),
            )

        task_id = task_id.strip()

        if not isinstance(confirmation, dict):
            return CommerceVerification(
                verified=False,
                status="unverified",
                task_id=task_id,
                issues=("Provider confirmation must be a dictionary.",),
            )

        confirmation_task_id = confirmation.get("task_id")
        if confirmation_task_id is not None:
            if not isinstance(confirmation_task_id, str):
                issues.append("Confirmation task ID must be a string.")
            elif confirmation_task_id.strip() != task_id:
                issues.append("Confirmation task ID does not match.")

        raw_status = confirmation.get("status")
        if not isinstance(raw_status, str) or not raw_status.strip():
            issues.append("Provider order status is missing.")
            status = "unverified"
        else:
            status = raw_status.strip().lower()

        raw_order_id = confirmation.get("provider_order_id")
        if raw_order_id is None:
            raw_order_id = confirmation.get("order_id")

        order_id = (
            raw_order_id.strip()
            if isinstance(raw_order_id, str) and raw_order_id.strip()
            else None
        )

        if status in self.SUCCESS_STATUSES:
            if order_id is None:
                issues.append("A provider order ID is required for confirmation.")
            if not issues:
                return CommerceVerification(
                    verified=True,
                    status="verified",
                    task_id=task_id,
                    order_id=order_id,
                )
            return CommerceVerification(
                verified=False,
                status="unverified",
                task_id=task_id,
                order_id=order_id,
                issues=tuple(issues),
            )

        if status in self.PENDING_STATUSES:
            issues.append("The provider has not confirmed the order yet.")
            return CommerceVerification(
                verified=False,
                status="pending",
                task_id=task_id,
                order_id=order_id,
                issues=tuple(issues),
            )

        if status in self.FAILURE_STATUSES:
            issues.append(f"Provider reports order status: {status}.")
            return CommerceVerification(
                verified=False,
                status="failed",
                task_id=task_id,
                order_id=order_id,
                issues=tuple(issues),
            )

        issues.append("Provider order status is not recognized.")
        return CommerceVerification(
            verified=False,
            status="unverified",
            task_id=task_id,
            order_id=order_id,
            issues=tuple(issues),
        )


def verify_commerce_order(
    task_id: str,
    confirmation: dict[str, Any],
) -> CommerceVerification:
    """Convenience function for verifying a commerce order confirmation."""
    return CommerceVerifier().verify(task_id, confirmation)
