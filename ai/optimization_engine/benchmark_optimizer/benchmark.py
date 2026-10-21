from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any, Callable, Iterable, Mapping

from .metrics import BenchmarkMetrics, BenchmarkMetricSummary, summarize_metrics
from .utils import (
    make_benchmark_id,
    make_case_id,
    merge_metadata,
    normalize_text,
    validate_name,
)


@dataclass(frozen=True)
class BenchmarkCase:
    name: str
    input: Any
    expected: Any = None
    metadata: Mapping[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        object.__setattr__(self, "name", validate_name(self.name))
        object.__setattr__(self, "metadata", dict(self.metadata))

    @property
    def case_id(self) -> str:
        return make_case_id(self.name, self.input)

    def as_dict(self) -> dict[str, Any]:
        return {
            "case_id": self.case_id,
            "name": self.name,
            "input": self.input,
            "expected": self.expected,
            "metadata": dict(self.metadata),
        }


@dataclass(frozen=True)
class BenchmarkRun:
    case_id: str
    metrics: BenchmarkMetrics
    output: Any = None
    metadata: Mapping[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not normalize_text(self.case_id):
            raise ValueError("case_id cannot be empty")
        object.__setattr__(self, "metadata", dict(self.metadata))

    @property
    def success(self) -> bool:
        return self.metrics.success

    def as_dict(self) -> dict[str, Any]:
        return {
            "case_id": self.case_id,
            "metrics": self.metrics.as_dict(),
            "output": self.output,
            "metadata": dict(self.metadata),
        }


@dataclass(frozen=True)
class BenchmarkResult:
    benchmark_id: str
    name: str
    runs: tuple[BenchmarkRun, ...]
    summary: BenchmarkMetricSummary
    metadata: Mapping[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        object.__setattr__(self, "name", validate_name(self.name))
        object.__setattr__(self, "runs", tuple(self.runs))
        object.__setattr__(self, "metadata", dict(self.metadata))

    @property
    def total_cases(self) -> int:
        return self.summary.sample_count

    @property
    def successful_cases(self) -> int:
        return self.summary.successful_count

    @property
    def failed_cases(self) -> int:
        return self.summary.failed_count

    @property
    def success_rate(self) -> Decimal:
        return self.summary.success_rate

    @property
    def error_rate(self) -> Decimal:
        return self.summary.error_rate

    @property
    def average_latency_ms(self) -> Decimal:
        return self.summary.average_latency_ms

    @property
    def average_time_to_first_token_ms(self) -> Decimal:
        return self.summary.average_time_to_first_token_ms

    @property
    def average_throughput_tokens_per_second(self) -> Decimal:
        return self.summary.average_throughput_tokens_per_second

    @property
    def average_cost(self) -> Decimal:
        return self.summary.average_cost

    @property
    def average_quality(self) -> Decimal:
        return self.summary.average_quality

    def as_dict(self) -> dict[str, Any]:
        return {
            "benchmark_id": self.benchmark_id,
            "name": self.name,
            "runs": [run.as_dict() for run in self.runs],
            "summary": self.summary.as_dict(),
            "metadata": dict(self.metadata),
        }


Executor = Callable[[BenchmarkCase], Any]


class Benchmark:
    """Execute benchmark cases and aggregate their metrics."""

    def __init__(
        self,
        name: str,
        cases: Iterable[BenchmarkCase],
        executor: Executor,
        *,
        metadata: Mapping[str, Any] | None = None,
    ) -> None:
        self.name = validate_name(name)
        self.cases = tuple(cases)

        if not self.cases:
            raise ValueError("cases cannot be empty")

        if not callable(executor):
            raise TypeError("executor must be callable")

        self.executor = executor
        self.metadata = dict(metadata or {})

        # Existing utility accepts only the benchmark name.
        self.benchmark_id = make_benchmark_id(self.name)

        self._runs: list[BenchmarkRun] = []

    @property
    def runs(self) -> tuple[BenchmarkRun, ...]:
        return tuple(self._runs)

    def run(self) -> BenchmarkResult:
        runs = [
            self._execute_case(case)
            for case in self.cases
        ]

        self._runs = runs

        summary = summarize_metrics(
            run.metrics for run in runs
        )

        return BenchmarkResult(
            benchmark_id=self.benchmark_id,
            name=self.name,
            runs=tuple(runs),
            summary=summary,
            metadata=dict(self.metadata),
        )

    def _execute_case(
        self,
        case: BenchmarkCase,
    ) -> BenchmarkRun:
        try:
            raw_result = self.executor(case)

            metrics, output, metadata = self._normalize_result(
                raw_result
            )

            combined_metadata = merge_metadata(
                case.metadata,
                metadata,
            )

            return BenchmarkRun(
                case_id=case.case_id,
                metrics=metrics,
                output=output,
                metadata=combined_metadata,
            )

        except Exception as exc:
            metrics = BenchmarkMetrics(
                success=False,
                error_type=type(exc).__name__,
                error_message=str(exc),
            )

            return BenchmarkRun(
                case_id=case.case_id,
                metrics=metrics,
                metadata=dict(case.metadata),
            )

    @staticmethod
    def _normalize_result(
        raw_result: Any,
    ) -> tuple[BenchmarkMetrics, Any, Mapping[str, Any]]:
        if isinstance(raw_result, BenchmarkMetrics):
            return raw_result, None, {}

        if isinstance(raw_result, BenchmarkRun):
            return (
                raw_result.metrics,
                raw_result.output,
                raw_result.metadata,
            )

        if isinstance(raw_result, Mapping):
            metrics_value = raw_result.get("metrics")

            if isinstance(metrics_value, BenchmarkMetrics):
                metrics = metrics_value

            elif isinstance(metrics_value, Mapping):
                metrics = BenchmarkMetrics(
                    latency_ms=metrics_value.get("latency_ms", 0),
                    time_to_first_token_ms=metrics_value.get(
                        "time_to_first_token_ms",
                        0,
                    ),
                    input_tokens=metrics_value.get(
                        "input_tokens",
                        0,
                    ),
                    output_tokens=metrics_value.get(
                        "output_tokens",
                        0,
                    ),
                    total_tokens=metrics_value.get(
                        "total_tokens",
                        0,
                    ),
                    throughput_tokens_per_second=metrics_value.get(
                        "throughput_tokens_per_second",
                        0,
                    ),
                    cost=metrics_value.get("cost", 0),
                    quality=metrics_value.get("quality", 0),
                    success=metrics_value.get("success", True),
                    error_type=metrics_value.get("error_type"),
                    error_message=metrics_value.get("error_message"),
                )

            else:
                metrics = BenchmarkMetrics(
                    latency_ms=raw_result.get("latency_ms", 0),
                    time_to_first_token_ms=raw_result.get(
                        "time_to_first_token_ms",
                        0,
                    ),
                    input_tokens=raw_result.get(
                        "input_tokens",
                        0,
                    ),
                    output_tokens=raw_result.get(
                        "output_tokens",
                        0,
                    ),
                    total_tokens=raw_result.get(
                        "total_tokens",
                        0,
                    ),
                    throughput_tokens_per_second=raw_result.get(
                        "throughput_tokens_per_second",
                        0,
                    ),
                    cost=raw_result.get("cost", 0),
                    quality=raw_result.get("quality", 0),
                    success=raw_result.get("success", True),
                    error_type=raw_result.get("error_type"),
                    error_message=raw_result.get("error_message"),
                )

            output = raw_result.get("output")
            metadata = raw_result.get("metadata", {})

            if not isinstance(metadata, Mapping):
                raise TypeError("metadata must be a mapping")

            return metrics, output, metadata

        raise TypeError(
            "executor must return BenchmarkMetrics, "
            "BenchmarkRun, or a mapping"
        )


def create_benchmark(
    name: str,
    cases: Iterable[BenchmarkCase],
    executor: Executor,
    *,
    metadata: Mapping[str, Any] | None = None,
) -> Benchmark:
    return Benchmark(
        name=name,
        cases=cases,
        executor=executor,
        metadata=metadata,
    )


__all__ = [
    "BenchmarkCase",
    "BenchmarkRun",
    "BenchmarkResult",
    "Benchmark",
    "Executor",
    "create_benchmark",
]
