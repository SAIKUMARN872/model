"""Safe recovery policies for uncertain action outcomes."""

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class RecoveryDecision:
    """Recommended response to an action failure or uncertain outcome."""

    action_id: str
    decision: str
    retry_allowed: bool
    requires_human_review: bool
    reason: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "action_id": self.action_id,
            "decision": self.decision,
            "retry_allowed": self.retry_allowed,
            "requires_human_review": self.requires_human_review,
            "reason": self.reason,
        }


class RecoveryManager:
    """Choose conservative recovery actions without executing retries."""

    def decide(
        self,
        action_id: str,
        status: str,
        *,
        idempotent: bool = False,
        retry_count: int = 0,
        max_retries: int = 2,
    ) -> RecoveryDecision:
        if not isinstance(action_id, str) or not action_id.strip():
            raise ValueError("action_id must be a non-empty string")
        if not isinstance(status, str) or not status.strip():
            raise ValueError("status must be a non-empty string")
        if not isinstance(idempotent, bool):
            raise TypeError("idempotent must be a bool")
        if type(retry_count) is not int or retry_count < 0:
            raise ValueError("retry_count must be a non-negative integer")
        if type(max_retries) is not int or max_retries < 0:
            raise ValueError("max_retries must be a non-negative integer")

        normalized = status.casefold()

        if normalized in {"confirmed", "completed", "succeeded", "success"}:
            return RecoveryDecision(
                action_id, "no_action", False, False,
                "The action is already reported successful; verify its outcome.",
            )

        if normalized in {"unknown", "pending", "processing", "timeout"}:
            return RecoveryDecision(
                action_id, "reconcile", False, True,
                "The outcome is uncertain. Check the provider before retrying.",
            )

        if normalized in {"failed", "error", "rejected"}:
            if not idempotent:
                return RecoveryDecision(
                    action_id, "manual_review", False, True,
                    "Retry is blocked because the operation is not declared idempotent.",
                )
            if retry_count >= max_retries:
                return RecoveryDecision(
                    action_id, "manual_review", False, True,
                    "The configured retry limit has been reached.",
                )
            return RecoveryDecision(
                action_id, "retry_candidate", True, False,
                "Retry may be considered for this idempotent failed operation.",
            )

        return RecoveryDecision(
            action_id, "manual_review", False, True,
            "The status is not recognized; automatic recovery is blocked.",
        )
