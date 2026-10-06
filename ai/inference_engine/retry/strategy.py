from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class RetryStrategy:
    """Configuration for inference retry behavior."""

    max_attempts: int = 3
    initial_delay_seconds: float = 0.5
    max_delay_seconds: float = 10.0
    exponential_base: float = 2.0

    def __post_init__(self) -> None:
        if self.max_attempts < 1:
            raise ValueError(
                "max_attempts must be at least 1."
            )

        if self.initial_delay_seconds < 0:
            raise ValueError(
                "initial_delay_seconds cannot be negative."
            )

        if self.max_delay_seconds < 0:
            raise ValueError(
                "max_delay_seconds cannot be negative."
            )

        if self.exponential_base < 1:
            raise ValueError(
                "exponential_base must be at least 1."
            )

    def delay_for_attempt(
        self,
        attempt: int,
    ) -> float:
        if attempt < 1:
            raise ValueError(
                "attempt must be at least 1."
            )

        delay = (
            self.initial_delay_seconds
            * self.exponential_base ** (attempt - 1)
        )

        return min(
            delay,
            self.max_delay_seconds,
        )