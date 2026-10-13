from typing import Any

from ..results.status import VerificationStatus
from ..results.verification_result import VerificationResult


def verify_action(
    expected_action: str,
    action_result: dict[str, Any] | None,
) -> VerificationResult:
    """Check recorded action evidence; never performs a browser action."""
    if not isinstance(expected_action, str) or not expected_action.strip():
        raise ValueError("expected_action must be a non-empty string.")

    if not isinstance(action_result, dict):
        return VerificationResult(
            VerificationStatus.INCONCLUSIVE,
            "action",
            "No valid action result was supplied.",
        )

    observed = action_result.get("action")
    if not isinstance(observed, str) or not observed.strip():
        return VerificationResult(
            VerificationStatus.INCONCLUSIVE,
            "action",
            "The action result does not identify the observed action.",
            [dict(action_result)],
        )

    if observed != expected_action:
        return VerificationResult(
            VerificationStatus.FAILED,
            "action",
            "The observed action does not match the expected action.",
            [{"expected_action": expected_action, "observed_action": observed}],
        )

    return VerificationResult(
        VerificationStatus.PASSED,
        "action",
        "The recorded action type matches the expected action.",
        [dict(action_result)],
    )
