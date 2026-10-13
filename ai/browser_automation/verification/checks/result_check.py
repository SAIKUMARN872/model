from typing import Any

from ..results.status import VerificationStatus
from ..results.verification_result import VerificationResult


def verify_result(
    result: Any,
    *,
    required_status: str = "completed",
    require_actions: int = 0,
) -> VerificationResult:
    """Inspect an execution result without treating action count as outcome proof."""
    if (
        not isinstance(required_status, str)
        or not required_status.strip()
        or isinstance(require_actions, bool)
        or not isinstance(require_actions, int)
        or require_actions < 0
    ):
        raise ValueError("Invalid required status or action count.")

    if result is None:
        return VerificationResult(
            VerificationStatus.INCONCLUSIVE,
            "execution_result",
            "No execution result was supplied.",
        )

    status = getattr(result, "status", None)
    if hasattr(status, "value"):
        status = status.value

    completed_actions = getattr(result, "completed_actions", None)
    evidence = [{
        "observed_status": status,
        "completed_actions": completed_actions,
        "required_status": required_status,
        "required_actions": require_actions,
    }]

    if not isinstance(status, str):
        return VerificationResult(
            VerificationStatus.INCONCLUSIVE,
            "execution_result",
            "The execution status is missing or invalid.",
            evidence,
        )

    if status != required_status:
        return VerificationResult(
            VerificationStatus.FAILED,
            "execution_result",
            "Execution status does not match the required status.",
            evidence,
        )

    if (
        isinstance(completed_actions, bool)
        or not isinstance(completed_actions, int)
        or completed_actions < require_actions
    ):
        return VerificationResult(
            VerificationStatus.FAILED,
            "execution_result",
            "The required number of actions was not completed.",
            evidence,
        )

    return VerificationResult(
        VerificationStatus.PASSED,
        "execution_result",
        "Execution metadata matches the requested conditions. This alone does not prove the business outcome.",
        evidence,
    )
