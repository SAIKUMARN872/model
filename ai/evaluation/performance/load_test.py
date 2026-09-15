"""
Load testing utilities.
"""

from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass, field
from typing import Any, Awaitable, Callable

from ..metrics.latency import (
    LatencyMetric,
)


@dataclass
class LoadTestResult:
    """Load test result."""

    total_requests: int
    successful_requests: int
    failed_requests: int
    duration_seconds: float
    requests_per_second: float
    latency: Any
    errors: list[str] = field(
        default_factory=list
    )

    @property
    def success_rate(self) -> float:

        if self.total_requests == 0:
            return 0.0

        return (
            self.successful_requests
            / self.total_requests
        )


class LoadTester:
    """Runs concurrent requests against an async operation."""

    async def run(
        self,
        operation: Callable[
            [int],
            Awaitable[Any],
        ],
        total_requests: int,
        concurrency: int = 10,
    ) -> LoadTestResult:

        if total_requests <= 0:
            raise ValueError(
                "total_requests must be positive."
            )

        if concurrency <= 0:
            raise ValueError(
                "concurrency must be positive."
            )

        semaphore = asyncio.Semaphore(
            concurrency
        )

        latencies: list[float] = []

        errors: list[str] = []

        successful = 0

        async def execute(
            request_id: int,
        ) -> bool:

            nonlocal successful

            async with semaphore:

                started = time.perf_counter()

                try:

                    await operation(
                        request_id
                    )

                    elapsed = (
                        time.perf_counter()
                        - started
                    ) * 1000

                    latencies.append(
                        elapsed
                    )

                    successful += 1

                    return True

                except Exception as exc:

                    errors.append(
                        str(exc)
                    )

                    return False

        started = time.perf_counter()

        await asyncio.gather(
            *[
                execute(index)
                for index in range(
                    total_requests
                )
            ]
        )

        duration = (
            time.perf_counter()
            - started
        )

        failed = (
            total_requests
            - successful
        )

        return LoadTestResult(
            total_requests=total_requests,
            successful_requests=successful,
            failed_requests=failed,
            duration_seconds=duration,
            requests_per_second=(
                total_requests / duration
                if duration > 0
                else 0.0
            ),
            latency=LatencyMetric.calculate(
                latencies
            ),
            errors=errors,
        )