from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class RetryPolicy:
    """
    Configuration for retrying a failed model/provider operation.
    """

    max_attempts: int = 2
    initial_delay_ms: int = 100
    max_delay_ms: int = 2000
    exponential_backoff: bool = True

    def __post_init__(self) -> None:
        if self.max_attempts < 1:
            raise ValueError("max_attempts must be at least 1.")

        if self.initial_delay_ms < 0:
            raise ValueError("initial_delay_ms cannot be negative.")

        if self.max_delay_ms < 0:
            raise ValueError("max_delay_ms cannot be negative.")

        if self.initial_delay_ms > self.max_delay_ms:
            raise ValueError(
                "initial_delay_ms cannot exceed max_delay_ms."
            )


class RetryController:
    """
    Deterministic retry controller.

    This class does not execute inference itself.
    It only determines whether another attempt is allowed
    and what delay should be used before that attempt.
    """

    def __init__(
        self,
        policy: RetryPolicy | None = None,
    ) -> None:
        self.policy = (
            policy
            if policy is not None
            else RetryPolicy()
        )

    @property
    def max_attempts(self) -> int:
        return self.policy.max_attempts

    def should_retry(
        self,
        attempt: int,
    ) -> bool:
        """
        Return True when another attempt is allowed.

        Attempts are 1-based.
        """
        if attempt < 1:
            raise ValueError("attempt must be at least 1.")

        return attempt < self.policy.max_attempts

    def delay_ms(
        self,
        attempt: int,
    ) -> int:
        """
        Calculate retry delay for the given attempt.

        Example with initial_delay_ms=100:

            attempt 1 -> 100 ms
            attempt 2 -> 200 ms
            attempt 3 -> 400 ms
        """
        if attempt < 1:
            raise ValueError("attempt must be at least 1.")

        if not self.policy.exponential_backoff:
            return self.policy.initial_delay_ms

        delay = (
            self.policy.initial_delay_ms
            * (2 ** (attempt - 1))
        )

        return min(
            delay,
            self.policy.max_delay_ms,
        )


__all__ = [
    "RetryPolicy",
    "RetryController",
]
