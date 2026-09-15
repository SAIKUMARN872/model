"""
Stress testing utilities.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Awaitable, Callable

from .load_test import (
    LoadTester,
)


@dataclass
class StressTestResult:
    """Stress test result."""

    levels: list[int]

    results: list[Any]

    peak_concurrency: int

    errors: list[str] = field(
        default_factory=list
    )


class StressTester:
    """
    Gradually increases concurrency to identify
    performance degradation or failures.
    """

    def __init__(
        self,
        load_tester: LoadTester | None = None,
    ) -> None:

        self.load_tester = (
            load_tester
            or LoadTester()
        )

    async def run(
        self,
        operation: Callable[
            [int],
            Awaitable[Any],
        ],
        levels: list[int],
        requests_per_level: int = 20,
    ) -> StressTestResult:

        if not levels:
            raise ValueError(
                "At least one concurrency level is required."
            )

        if any(
            level <= 0
            for level in levels
        ):

            raise ValueError(
                "Concurrency levels must be positive."
            )

        if requests_per_level <= 0:
            raise ValueError(
                "requests_per_level must be positive."
            )

        results = []

        errors = []

        for concurrency in levels:

            try:

                result = await self.load_tester.run(
                    operation,
                    requests_per_level,
                    concurrency,
                )

                results.append(
                    result
                )

                errors.extend(
                    result.errors
                )

            except Exception as exc:

                errors.append(
                    str(exc)
                )

        return StressTestResult(
            levels=list(levels),
            results=results,
            peak_concurrency=max(
                levels
            ),
            errors=errors,
        )