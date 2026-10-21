from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import TypeVar

from ai.providers.base.exceptions import ProviderError

from .backoff import sleep_before_retry
from .strategy import RetryStrategy


T = TypeVar("T")


class RetryExecutor:
    """Retry only failures classified as potentially recoverable."""

    def __init__(
        self,
        strategy: RetryStrategy | None = None,
    ) -> None:
        self.strategy = strategy or RetryStrategy()

    async def execute(
        self,
        operation: Callable[[], Awaitable[T]],
    ) -> T:
        for attempt in range(1, self.strategy.max_attempts + 1):
            try:
                return await operation()
            except Exception as exc:
                if not self._should_retry(exc):
                    raise

                if attempt >= self.strategy.max_attempts:
                    raise

                await sleep_before_retry(self.strategy, attempt)

        raise RuntimeError(
            "Retry execution failed without an exception."
        )

    @staticmethod
    def _should_retry(exception: Exception) -> bool:
        if isinstance(exception, ProviderError):
            return bool(exception.retryable)

        return isinstance(
            exception,
            (TimeoutError, ConnectionError, OSError),
        )


__all__ = ["RetryExecutor"]
