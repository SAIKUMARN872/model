"""
General AI performance evaluation.
"""

from __future__ import annotations

import inspect
import time
from dataclasses import dataclass, field
from typing import Any, Callable

from ..metrics.latency import (
    LatencyMetric,
)


@dataclass
class PerformanceResult:
    """Performance measurement."""

    iterations: int

    successful: int

    failed: int

    latency: Any

    total_duration_ms: float

    throughput: float

    errors: list[str] = field(
        default_factory=list
    )

    @property
    def success_rate(self) -> float:

        if self.iterations == 0:
            return 0.0

        return (
            self.successful
            / self.iterations
        )


class PerformanceTester:
    """Measures repeated operation performance."""

    async def run(
        self,
        operation: Callable[[], Any],
        iterations: int = 10,
    ) -> PerformanceResult:

        if iterations <= 0:
            raise ValueError(
                "iterations must be positive."
            )

        latencies = []

        errors = []

        successful = 0

        started_total = time.perf_counter()

        for _ in range(iterations):

            started = time.perf_counter()

            try:

                result = operation()

                if inspect.isawaitable(
                    result
                ):

                    await result

                successful += 1

                latencies.append(
                    (
                        time.perf_counter()
                        - started
                    ) * 1000
                )

            except Exception as exc:

                errors.append(
                    str(exc)
                )

        total_ms = (
            time.perf_counter()
            - started_total
        ) * 1000

        return PerformanceResult(
            iterations=iterations,
            successful=successful,
            failed=(
                iterations
                - successful
            ),
            latency=LatencyMetric.calculate(
                latencies
            ),
            total_duration_ms=total_ms,
            throughput=(
                successful
                / (total_ms / 1000)
                if total_ms > 0
                else 0.0
            ),
            errors=errors,
        )