"""Shared confirmation models for ModelNow action execution."""

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class ActionConfirmation:
    task_id: str
    status: str
    confirmed: bool
    confirmation_id: str | None = None
    provider: str | None = None
    details: dict[str, Any] = field(default_factory=dict)
    issues: tuple[str, ...] = ()

    def to_dict(self) -> dict[str, Any]:
        return {
            "task_id": self.task_id,
            "status": self.status,
            "confirmed": self.confirmed,
            "confirmation_id": self.confirmation_id,
            "provider": self.provider,
            "details": dict(self.details),
            "issues": list(self.issues),
        }


class ActionConfirmationVerifier:
    """Validate the structure and consistency of action confirmation evidence.

    The caller is responsible for obtaining evidence from a trusted source.
    This class does not independently authenticate external provider data.
    """

    SUCCESS_STATUSES = {
        "confirmed", "completed", "success", "succeeded", "placed"
    }
    PENDING_STATUSES = {
        "pending", "processing", "awaiting_confirmation", "in_progress"
    }
    FAILURE_STATUSES = {
        "failed", "cancelled", "canceled", "rejected", "declined"
    }

    def verify(
        self,
        task_id: str,
        evidence: dict[str, Any],
    ) -> ActionConfirmation:
        if not isinstance(task_id, str) or not task_id.strip():
            return ActionConfirmation(
                task_id="",
                status="unverified",
                confirmed=False,
                issues=("A non-empty task_id is required.",),
            )

        task_id = task_id.strip()

        if not isinstance(evidence, dict):
            return ActionConfirmation(
                task_id=task_id,
                status="unverified",
                confirmed=False,
                issues=("Confirmation evidence must be a dictionary.",),
            )

        issues: list[str] = []

        evidence_task_id = evidence.get("task_id")
        if evidence_task_id is not None:
            if not isinstance(evidence_task_id, str):
                issues.append("Evidence task ID must be a string.")
            elif evidence_task_id.strip() != task_id:
                issues.append("Evidence task ID does not match.")

        raw_status = evidence.get("status")
        if not isinstance(raw_status, str) or not raw_status.strip():
            issues.append("Confirmation status is missing.")
            status = "unverified"
        else:
            status = raw_status.strip().lower()

        raw_id = evidence.get("confirmation_id")
        if raw_id is None:
            raw_id = evidence.get("provider_confirmation_id")

        confirmation_id = (
            raw_id.strip()
            if isinstance(raw_id, str) and raw_id.strip()
            else None
        )

        provider = evidence.get("provider")
        if provider is not None and (
            not isinstance(provider, str) or not provider.strip()
        ):
            issues.append("Provider must be a non-empty string when supplied.")
            provider = None
        elif isinstance(provider, str):
            provider = provider.strip()

        details = evidence.get("details", {})
        if not isinstance(details, dict):
            issues.append("Confirmation details must be a dictionary.")
            details = {}

        if status in self.SUCCESS_STATUSES:
            if confirmation_id is None:
                issues.append(
                    "A confirmation ID is required for successful actions."
                )

            if not issues:
                return ActionConfirmation(
                    task_id=task_id,
                    status="confirmed",
                    confirmed=True,
                    confirmation_id=confirmation_id,
                    provider=provider,
                    details=dict(details),
                )

            return ActionConfirmation(
                task_id=task_id,
                status="unverified",
                confirmed=False,
                confirmation_id=confirmation_id,
                provider=provider,
                details=dict(details),
                issues=tuple(issues),
            )

        if status in self.PENDING_STATUSES:
            issues.append("The action has not been confirmed as complete.")
            return ActionConfirmation(
                task_id=task_id,
                status="pending",
                confirmed=False,
                confirmation_id=confirmation_id,
                provider=provider,
                details=dict(details),
                issues=tuple(issues),
            )

        if status in self.FAILURE_STATUSES:
            issues.append(f"Evidence reports action status: {status}.")
            return ActionConfirmation(
                task_id=task_id,
                status="failed",
                confirmed=False,
                confirmation_id=confirmation_id,
                provider=provider,
                details=dict(details),
                issues=tuple(issues),
            )

        issues.append("Confirmation status is not recognized.")
        return ActionConfirmation(
            task_id=task_id,
            status="unverified",
            confirmed=False,
            confirmation_id=confirmation_id,
            provider=provider,
            details=dict(details),
            issues=tuple(issues),
        )


def verify_action_confirmation(
    task_id: str,
    evidence: dict[str, Any],
) -> ActionConfirmation:
    """Convenience function for verifying action confirmation evidence."""
    return ActionConfirmationVerifier().verify(task_id, evidence)
