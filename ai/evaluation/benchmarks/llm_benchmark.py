"""
LLM-specific benchmarking.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable

from .benchmark import (
    Benchmark,
    BenchmarkCase,
    BenchmarkResult,
)
from .utils import (
    average,
    percentile,
)


@dataclass
class LLMCase(BenchmarkCase):
    """LLM benchmark case."""

    category: str = "general"


@dataclass
class LLMResult:
    """LLM benchmark metrics."""

    benchmark: BenchmarkResult

    average_latency_ms: float

    p95_latency_ms: float

    average_cost: float

    average_tokens: float

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


class LLMBenchmark:
    """
    Measures model quality and operational metrics.
    """

    def __init__(
        self,
        name: str = "llm_benchmark",
    ) -> None:

        self.name = name

    async def run(
        self,
        cases: list[LLMCase],
        predictor: Callable[
            [Any],
            Any,
        ],
        evaluator: Callable[
            [Any, Any],
            Any,
        ],
    ) -> LLMResult:

        import inspect
        import time

        latencies: list[float] = []

        costs: list[float] = []

        tokens: list[float] = []

        wrapped_cases = []

        for case in cases:

            started = time.perf_counter()

            prediction = predictor(
                case.input_data
            )

            if inspect.isawaitable(
                prediction
            ):

                prediction = await prediction

            elapsed = (
                time.perf_counter()
                - started
            ) * 1000

            latencies.append(
                elapsed
            )

            if isinstance(
                prediction,
                dict,
            ):

                costs.append(
                    float(
                        prediction.get(
                            "cost",
                            0.0,
                        )
                    )
                )

                tokens.append(
                    float(
                        prediction.get(
                            "tokens",
                            0.0,
                        )
                    )
                )

                output = prediction.get(
                    "output",
                    "",
                )

            else:

                output = prediction

            wrapped_cases.append(
                BenchmarkCase(
                    case_id=case.case_id,
                    input_data=case.input_data,
                    expected=case.expected,
                    metadata={
                        **case.metadata,
                        "output": output,
                    },
                )
            )

        async def fixed_predictor(
            data: Any,
        ) -> Any:

            for case in wrapped_cases:

                if case.input_data == data:

                    return case.metadata[
                        "output"
                    ]

            return ""

        benchmark = Benchmark(
            self.name,
            evaluator,
        )

        result = await benchmark.run(
            wrapped_cases,
            fixed_predictor,
        )

        return LLMResult(
            benchmark=result,
            average_latency_ms=average(
                latencies
            ),
            p95_latency_ms=percentile(
                latencies,
                95,
            ),
            average_cost=average(
                costs
            ),
            average_tokens=average(
                tokens
            ),
        )