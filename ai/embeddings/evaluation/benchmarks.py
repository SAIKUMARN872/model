"""
Benchmark framework for ModelNow.

Provides:
- benchmark cases
- benchmark suites
- benchmark execution
- benchmark result aggregation
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from typing import Any, Awaitable, Callable

from .utils import (
    elapsed_ms,
    timer_start,
    utc_now,
)


@dataclass
class BenchmarkCase:
    """
    One benchmark test case.
    """

    case_id: str

    input: Any

    expected: Any = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    tags: list[str] = field(
        default_factory=list
    )


@dataclass
class BenchmarkResult:
    """
    Result of one benchmark case.
    """

    case_id: str

    prediction: Any

    expected: Any

    passed: bool

    duration_ms: float

    error: str | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "case_id": self.case_id,
            "prediction": self.prediction,
            "expected": self.expected,
            "passed": self.passed,
            "duration_ms": self.duration_ms,
            "error": self.error,
            "metadata": dict(
                self.metadata
            ),
        }


@dataclass
class BenchmarkReport:
    """
    Aggregated benchmark report.
    """

    name: str

    total_cases: int

    passed_cases: int

    failed_cases: int

    accuracy: float

    average_duration_ms: float

    results: list[BenchmarkResult] = field(
        default_factory=list
    )

    created_at: Any = field(
        default_factory=utc_now
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "name": self.name,
            "total_cases": self.total_cases,
            "passed_cases": self.passed_cases,
            "failed_cases": self.failed_cases,
            "accuracy": self.accuracy,
            "average_duration_ms": (
                self.average_duration_ms
            ),
            "results": [
                result.to_dict()
                for result in self.results
            ],
            "created_at": (
                self.created_at.isoformat()
            ),
            "metadata": dict(
                self.metadata
            ),
        }


class BenchmarkSuite:
    """
    Collection of benchmark cases.
    """

    def __init__(
        self,
        name: str,
        cases: list[BenchmarkCase] | None = None,
    ) -> None:

        if not name.strip():

            raise ValueError(
                "Benchmark name cannot be empty"
            )

        self.name = name

        self.cases = cases or []

    def add(
        self,
        case: BenchmarkCase,
    ) -> None:

        if any(
            existing.case_id
            == case.case_id
            for existing
            in self.cases
        ):

            raise ValueError(
                f"Duplicate benchmark case: "
                f"{case.case_id}"
            )

        self.cases.append(
            case
        )

    def extend(
        self,
        cases: list[BenchmarkCase],
    ) -> None:

        for case in cases:
            self.add(case)

    def get(
        self,
        case_id: str,
    ) -> BenchmarkCase:

        for case in self.cases:

            if case.case_id == case_id:
                return case

        raise KeyError(
            f"Benchmark case not found: "
            f"{case_id}"
        )

    def filter_by_tag(
        self,
        tag: str,
    ) -> "BenchmarkSuite":

        return BenchmarkSuite(
            name=f"{self.name}:{tag}",
            cases=[
                case
                for case
                in self.cases
                if tag in case.tags
            ],
        )

    def __len__(self) -> int:
        return len(self.cases)


class BenchmarkRunner:
    """
    Executes benchmark suites against a callable.
    """

    def __init__(
        self,
        evaluator: Callable[
            [Any],
            Any,
        ],
        comparator: Callable[
            [Any, Any],
            bool,
        ] | None = None,
    ) -> None:

        self.evaluator = evaluator

        self.comparator = (
            comparator
            or self._default_comparator
        )

    async def run_async(
        self,
        suite: BenchmarkSuite,
    ) -> BenchmarkReport:

        results: list[
            BenchmarkResult
        ] = []

        for case in suite.cases:

            started_at = timer_start()

            try:

                prediction = (
                    self.evaluator(
                        case.input
                    )
                )

                if asyncio.iscoroutine(
                    prediction
                ):

                    prediction = (
                        await prediction
                    )

                passed = self.comparator(
                    prediction,
                    case.expected,
                )

                results.append(
                    BenchmarkResult(
                        case_id=case.case_id,
                        prediction=prediction,
                        expected=case.expected,
                        passed=passed,
                        duration_ms=elapsed_ms(
                            started_at
                        ),
                        metadata=dict(
                            case.metadata
                        ),
                    )
                )

            except Exception as exc:

                results.append(
                    BenchmarkResult(
                        case_id=case.case_id,
                        prediction=None,
                        expected=case.expected,
                        passed=False,
                        duration_ms=elapsed_ms(
                            started_at
                        ),
                        error=str(exc),
                        metadata=dict(
                            case.metadata
                        ),
                    )
                )

        return self._build_report(
            suite,
            results,
        )

    def run(
        self,
        suite: BenchmarkSuite,
    ) -> BenchmarkReport:

        return asyncio.run(
            self.run_async(
                suite
            )
        )

    @staticmethod
    def _default_comparator(
        prediction: Any,
        expected: Any,
    ) -> bool:

        if isinstance(
            prediction,
            str,
        ) and isinstance(
            expected,
            str,
        ):

            return (
                prediction.strip().lower()
                == expected.strip().lower()
            )

        return prediction == expected

    @staticmethod
    def _build_report(
        suite: BenchmarkSuite,
        results: list[BenchmarkResult],
    ) -> BenchmarkReport:

        total = len(results)

        passed = sum(
            result.passed
            for result in results
        )

        failed = (
            total - passed
        )

        average_duration = (
            sum(
                result.duration_ms
                for result in results
            )
            / total
            if total
            else 0.0
        )

        accuracy = (
            passed / total
            if total
            else 0.0
        )

        return BenchmarkReport(
            name=suite.name,
            total_cases=total,
            passed_cases=passed,
            failed_cases=failed,
            accuracy=accuracy,
            average_duration_ms=(
                average_duration
            ),
            results=results,
        )