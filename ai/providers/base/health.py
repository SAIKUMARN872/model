@'
from __future__ import annotations

import time
from collections.abc import Awaitable, Callable
from typing import Any

from .models import ProviderHealth, ProviderStatus


class HealthChecker:
    """
    Shared health-check utility for ModelNow providers.

    Measures provider operation latency and converts failures
    into a normalized ProviderHealth result.
    """

    def __init__(
        self,
        *,
        provider: str,
        timeout_seconds: float = 10.0,
    ) -> None:
        self.provider = provider
        self.timeout_seconds = timeout_seconds

    async def check(
        self,
        operation: Callable[[], Awaitable[Any]],
    ) -> ProviderHealth:
        """
        Execute an async health operation and return normalized health.
        """

        started = time.perf_counter()

        try:
            result = await operation()

            latency_ms = (
                time.perf_counter() - started
            ) * 1000.0

            return ProviderHealth(
                healthy=True,
                provider=self.provider,
                status=ProviderStatus.READY,
                latency_ms=latency_ms,
                message="Provider health check succeeded.",
            )

        except Exception as exc:
            latency_ms = (
                time.perf_counter() - started
            ) * 1000.0

            return ProviderHealth(
                healthy=False,
                provider=self.provider,
                status=ProviderStatus.UNAVAILABLE,
                latency_ms=latency_ms,
                message=str(exc),
                metadata={
                    "exception_type": type(exc).__name__,
                },
            )
'@ | Set-Content -Path ".\ai\providers\base\health.py" -Encoding UTF8