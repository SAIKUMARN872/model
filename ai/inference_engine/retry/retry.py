from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import TypeVar

from .backoff import sleep_before_retry
from .strategy import RetryStrategy


T = TypeVar("T")


class RetryExecutor:
    """Execute an async operation with retry support."""

    def __init__(
        self,
        strategy: RetryStrategy | None = None,
    ) -> None:
        self.strategy = (
            strategy
            or RetryStrategy()
        )

    async def execute(
        self,
        operation: Callable[[], Awaitable[T]],
    ) -> T:
        last_error: Exception | None = None

        for attempt in range(
            1,
            self.strategy.max_attempts + 1,
        ):
            try:
                return await operation()

            except Exception as exc:
                last_error = exc

                if (
                    attempt
                    >= self.strategy.max_attempts
                ):
                    raise

                await sleep_before_retry(
                    self.strategy,
                    attempt,
                )

        if last_error is not None:
            raise last_error

        raise RuntimeError(
            "Retry execution failed without an exception."
        )


__all__ = ["RetryExecutor"]