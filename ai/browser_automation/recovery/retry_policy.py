"""Bounded retry policy for recoverable browser failures."""

from __future__ import annotations

from dataclasses import dataclass
import random

from .failure_handler import FailureDecision


@dataclass(frozen=True)
class RetryPolicy:
    max_attempts: int = 3
    base_delay_seconds: float = 0.25
    max_delay_seconds: float = 4.0
    jitter: bool = True

    def __post_init__(self) -> None:
        if isinstance(self.max_attempts, bool) or not isinstance(self.max_attempts, int) or self.max_attempts < 1:
            raise ValueError("max_attempts must be a positive integer.")
        if self.base_delay_seconds < 0 or self.max_delay_seconds < 0:
            raise ValueError("Retry delays cannot be negative.")
        if self.base_delay_seconds > self.max_delay_seconds:
            raise ValueError("Base delay cannot exceed maximum delay.")

    def should_retry(self, decision: FailureDecision, attempt: int) -> bool:
        if isinstance(attempt, bool) or not isinstance(attempt, int) or attempt < 1:
            raise ValueError("attempt must be a positive integer.")
        return decision.retryable and attempt < self.max_attempts

    def delay_seconds(self, attempt: int) -> float:
        if isinstance(attempt, bool) or not isinstance(attempt, int) or attempt < 1:
            raise ValueError("attempt must be a positive integer.")
        delay = min(self.max_delay_seconds, self.base_delay_seconds * (2 ** (attempt - 1)))
        if self.jitter and delay > 0:
            delay = random.uniform(delay * 0.5, delay)
        return delay
