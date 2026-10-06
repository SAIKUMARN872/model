from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum


class RecoveryAction(StrEnum):
    RETRY = "retry"
    FALLBACK = "fallback"
    FAIL = "fail"


@dataclass(frozen=True)
class RecoveryDecision:
    """
    Decision describing how the routing system should recover
    from a failed inference attempt.
    """

    action: RecoveryAction
    attempt: int
    reason: str


class RecoveryController:
    """
    Deterministic recovery policy.

    Recovery order:

        retry same model
              ↓
        fallback model
              ↓
             fail
    """

    def __init__(
        self,
        max_retries: int = 1,
    ) -> None:
        if max_retries < 0:
            raise ValueError(
                "max_retries cannot be negative."
            )

        self.max_retries = max_retries

    def decide(
        self,
        attempt: int,
        fallback_available: bool,
    ) -> RecoveryDecision:
        """
        Decide the next recovery action.

        `attempt` is 1-based and represents the failed attempt.
        """

        if attempt < 1:
            raise ValueError(
                "attempt must be at least 1."
            )

        if attempt <= self.max_retries:
            return RecoveryDecision(
                action=RecoveryAction.RETRY,
                attempt=attempt,
                reason=(
                    "Retrying the current model after "
                    "a recoverable inference failure."
                ),
            )

        if fallback_available:
            return RecoveryDecision(
                action=RecoveryAction.FALLBACK,
                attempt=attempt,
                reason=(
                    "Retry limit reached; switching to "
                    "an eligible fallback model."
                ),
            )

        return RecoveryDecision(
            action=RecoveryAction.FAIL,
            attempt=attempt,
            reason=(
                "Retry limit reached and no eligible "
                "fallback model is available."
            ),
        )


__all__ = [
    "RecoveryAction",
    "RecoveryDecision",
    "RecoveryController",
]
