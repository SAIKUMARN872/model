from __future__ import annotations

import asyncio
import random
from dataclasses import dataclass
from typing import Awaitable, Callable, TypeVar

from .exceptions import ProviderError


T = TypeVar("T")


@dataclass(frozen=True)
class RetryPolicy:
    max_attempts: int = 3
    base_delay_seconds: float = 0.5
    max_delay_seconds: float = 30.0
    exponential_base: float = 2.0
    jitter: float = 0.25

    def __post_init__(self) -> None:
        if self.max_attempts < 1:
            raise ValueError("max_attempts must be >= 1")

        if self.base_delay_seconds < 0:
            raise ValueError(
                "base_delay_seconds must be >= 0"
            )

        if self.max_delay_seconds < 0:
            raise ValueError(
                "max_delay_seconds must be >= 0"
            )

        if self.exponential_base < 1:
            raise ValueError(
                "exponential_base must be >= 1"
            )

        if self.jitter < 0:
            raise ValueError(
                "jitter must be >= 0"
            )


class RetryManager:
    def __init__(
        self,
        policy: RetryPolicy | None = None,
    ) -> None:
        self.policy = policy or RetryPolicy()

    async def execute(
        self,
        operation: Callable[[], Awaitable[T]],
    ) -> T:
        last_error: Exception | None = None

        for attempt in range(
            1,
            self.policy.max_attempts + 1,
        ):
            try:
                return await operation()

            except Exception as exc:
                last_error = exc

                if not self._should_retry(exc):
                    raise

                if attempt >= self.policy.max_attempts:
                    raise

                delay = self._calculate_delay(
                    attempt=attempt,
                    exception=exc,
                )

                if delay > 0:
                    await asyncio.sleep(delay)

        if last_error is not None:
            raise last_error

        raise RuntimeError(
            "RetryManager reached an invalid state."
        )

    def _should_retry(
        self,
        exception: Exception,
    ) -> bool:
        if isinstance(exception, ProviderError):
            return bool(exception.retryable)

        return isinstance(
            exception,
            (
                TimeoutError,
                ConnectionError,
                OSError,
            ),
        )

    def _calculate_delay(
        self,
        *,
        attempt: int,
        exception: Exception,
    ) -> float:
        retry_after = getattr(
            exception,
            "retry_after",
            None,
        )

        if retry_after is not None:
            try:
                retry_after_value = float(
                    retry_after
                )
            except (TypeError, ValueError):
                retry_after_value = 0.0

            if retry_after_value > 0:
                return min(
                    retry_after_value,
                    self.policy.max_delay_seconds,
                )

        delay = (
            self.policy.base_delay_seconds
            * (
                self.policy.exponential_base
                ** max(0, attempt - 1)
            )
        )

        delay = min(
            delay,
            self.policy.max_delay_seconds,
        )

        if self.policy.jitter > 0:
            jitter_range = (
                delay * self.policy.jitter
            )

            delay += random.uniform(
                -jitter_range,
                jitter_range,
            )

        return max(
            0.0,
            min(
                delay,
                self.policy.max_delay_seconds,
            ),
        )

    async def run(
        self,
        operation: Callable[[], Awaitable[T]],
    ) -> T:
        return await self.execute(operation)


__all__ = [
    "RetryPolicy",
    "RetryManager",
]
