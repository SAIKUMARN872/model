"""
Generic benchmark framework.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable


@dataclass
class BenchmarkCase:
    """Single benchmark case."""

    case_id: str

    input_data: Any

    expected: Any = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


@dataclass
class BenchmarkResult:
    """Benchmark execution result."""

    benchmark_name: str

    total_cases: int

    passed_cases: int

    score: float

    duration_ms: float

    case_results: list[dict[str, Any]] = field(
        default_factory=list
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


class Benchmark:
    """
    Generic benchmark runner.

    evaluator must accept:

        evaluator(prediction, expected)

    and return either a numeric score or an object
    containing a `value` attribute.
    """

    def __init__(
        self,
        name: str,
        evaluator: Callable[
            [Any, Any],
            Any,
        ],
    ) -> None:

        self.name = name.strip()

        if not self.name:
            raise ValueError(
                "Benchmark name cannot be empty."
            )

        self.evaluator = evaluator

    async def run(
        self,
        cases: list[BenchmarkCase],
        predictor: Callable[
            [Any],
            Any,
        ],
    ) -> BenchmarkResult:

        import inspect
        import time

        started = time.perf_counter()

        results: list[
            dict[str, Any]
        ] = []

        for case in cases:

            prediction = predictor(
                case.input_data
            )

            if inspect.isawaitable(
                prediction
            ):

                prediction = await prediction

            score = self.evaluator(
                prediction,
                case.expected,
            )

            if hasattr(
                score,
                "value",
            ):

                numeric_score = float(
                    score.value
                )

            else:

                numeric_score = float(
                    score
                )

            passed = (
                numeric_score >= 1.0
            )

            results.append(
                {
                    "case_id": case.case_id,
                    "prediction": prediction,
                    "expected": case.expected,
                    "score": numeric_score,
                    "passed": passed,
                }
            )

        total = len(
            cases
        )

        passed = sum(
            item["passed"]
            for item in results
        )

        score = (
            sum(
                item["score"]
                for item in results
            )
            / total
            if total
            else 0.0
        )

        duration_ms = (
            time.perf_counter()
            - started
        ) * 1000

        return BenchmarkResult(
            benchmark_name=self.name,
            total_cases=total,
            passed_cases=int(passed),
            score=score,
            duration_ms=duration_ms,
            case_results=results,
        )