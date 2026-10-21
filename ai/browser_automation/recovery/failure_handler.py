"""Failure classification for browser task recovery."""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class FailureKind(str, Enum):
    TRANSIENT = "transient"
    PERMANENT = "permanent"
    PERMISSION = "permission"
    VALIDATION = "validation"
    UNKNOWN_OUTCOME = "unknown_outcome"


@dataclass(frozen=True)
class FailureDecision:
    kind: FailureKind
    retryable: bool
    reason: str


def classify_failure(
    error: BaseException,
    *,
    external_side_effect_possible: bool = False,
) -> FailureDecision:
    """Classify an error conservatively; do not retry uncertain side effects."""
    if external_side_effect_possible:
        return FailureDecision(
            FailureKind.UNKNOWN_OUTCOME,
            False,
            "An external side effect may already have occurred; reconcile first.",
        )

    name = type(error).__name__.lower()
    message = str(error).lower()

    if isinstance(error, (PermissionError,)):
        return FailureDecision(FailureKind.PERMISSION, False, "Permission denied.")

    if isinstance(error, (ValueError, TypeError)):
        return FailureDecision(FailureKind.VALIDATION, False, "Input or state validation failed.")

    if any(term in name or term in message for term in (
        "timeout", "temporarily unavailable", "connection reset",
        "connection refused", "target closed", "net::err_connection",
    )):
        return FailureDecision(FailureKind.TRANSIENT, True, "Potentially transient browser or network failure.")

    return FailureDecision(FailureKind.PERMANENT, False, "Failure is not known to be safely retryable.")
