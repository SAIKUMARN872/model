from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Iterable, Mapping, Sequence

from .metrics import BenchmarkMetricSummary, BenchmarkMetrics


def _to_decimal(value: Decimal | int | float | str) -> Decimal:
    if isinstance(value, Decimal):
        return value
    return Decimal(str(value))


@dataclass(frozen=True)
class BenchmarkCase:
    """A single benchmark input case."""

    case_id: str
    prompt: str
    expected_output: str | None = None
    metadata: Mapping[str, object] = field(default_factory=dict)

    def __post_init__(self) -> None:
        case_id = str(self.case_id).strip()
        prompt = str(self.prompt)

        if not case_id:
            raise ValueError("case_id must not be empty")

        if not prompt.strip():
            raise ValueError("prompt must not be empty")

        object.__setattr__(self, "case_id", case_id)
        object.__setattr__(self, "prompt", prompt)


@dataclass(frozen=True)
class BenchmarkRun:
    """Result of running one benchmark case."""

    case_id: str
    metrics: BenchmarkMetrics
    output: str | None = None
    error: str | None = None
    metadata: Mapping[str, object] = field(default_factory=dict)

    @property
    def is_successful(self) -> bool:
        return self.error is None and self.metrics.is_successful


@dataclass(frozen=True)
class BenchmarkResult:
    """Aggregated result for a benchmark execution."""

    benchmark_name: str
    runs: tuple[BenchmarkRun, ...]
    metrics_summary: Mapping[str, BenchmarkMetricSummary]
    metadata: Mapping[str, object] = field(default_factory=dict)

    @property
    def total_cases(self) -> int:
        return len(self.runs)

    @property
    def successful_cases(self) -> int:
        return sum(1 for run in self.runs if run.is_successful)

    @property
    def failed_cases(self) -> int:
        return self.total_cases - self.successful_cases

    @property
    def success_rate(self) -> Decimal:
        if self.total_cases == 0:
            return Decimal("0")
        return (
            Decimal(self.successful_cases)
            / Decimal(self.total_cases)
        )

    @property
    def average_latency_ms(self) -> Decimal:
        summary = self.metrics_summary.get("latency_ms")
        return summary.average if summary else Decimal("0")

    @property
    def average_cost(self) -> Decimal:
        summary = self.metrics_summary.get("cost")
        return summary.average if summary else Decimal("0")

    @property
    def average_quality_score(self) -> Decimal:
        summary = self.metrics_summary.get("quality_score")
        return summary.average if summary else Decimal("0")


class Benchmark:
    """Benchmark runner and aggregator.

    The class deliberately keeps execution separate from metric aggregation.
    A caller supplies an executor that receives a BenchmarkCase and returns
    either a BenchmarkRun or BenchmarkMetrics/output information.
    """

    def __init__(
        self,
        name: str,
        cases: Iterable[BenchmarkCase] | None = None,
    ) -> None:
        name = str(name).strip()

        if not name:
            raise ValueError("benchmark name must not be empty")

        self.name = name
        self._cases: list[BenchmarkCase] = list(cases or [])

    @property
    def cases(self) -> tuple[BenchmarkCase, ...]:
        return tuple(self._cases)

    def add_case(self, case: BenchmarkCase) -> None:
        if not isinstance(case, BenchmarkCase):
            raise TypeError("case must be a BenchmarkCase")
        self._cases.append(case)

    def run(
        self,
        executor,
    ) -> BenchmarkResult:
        """Run every case through the supplied executor.

        Supported executor return values:

        - BenchmarkRun
        - BenchmarkMetrics
        - Mapping containing ``metrics``, optionally ``output``,
          ``error`` and ``metadata``.
        """

        if not callable(executor):
            raise TypeError("executor must be callable")

        runs: list[BenchmarkRun] = []

        for case in self._cases:
            try:
                value = executor(case)
                run = self._coerce_run(case, value)
            except Exception as exc:
                run = BenchmarkRun(
                    case_id=case.case_id,
                    metrics=BenchmarkMetrics(),
                    error=str(exc),
                )

            runs.append(run)

        return self._build_result(runs)

    def aggregate(
        self,
        runs: Iterable[BenchmarkRun],
    ) -> BenchmarkResult:
        """Aggregate already-computed benchmark runs."""

        normalized_runs = tuple(runs)

        for run in normalized_runs:
            if not isinstance(run, BenchmarkRun):
                raise TypeError("runs must contain BenchmarkRun objects")

        return self._build_result(normalized_runs)

    def _coerce_run(
        self,
        case: BenchmarkCase,
        value,
    ) -> BenchmarkRun:
        if isinstance(value, BenchmarkRun):
            if value.case_id != case.case_id:
                raise ValueError(
                    "executor returned a run for a different case"
                )
            return value

        if isinstance(value, BenchmarkMetrics):
            return BenchmarkRun(
                case_id=case.case_id,
                metrics=value,
            )

        if isinstance(value, Mapping):
            metrics = value.get("metrics")

            if not isinstance(metrics, BenchmarkMetrics):
                raise TypeError(
                    "mapping executor result must contain BenchmarkMetrics "
                    "under 'metrics'"
                )

            return BenchmarkRun(
                case_id=case.case_id,
                metrics=metrics,
                output=value.get("output"),
                error=value.get("error"),
                metadata=value.get("metadata", {}),
            )

        raise TypeError(
            "executor must return BenchmarkRun, BenchmarkMetrics, "
            "or a mapping containing BenchmarkMetrics"
        )

    def _build_result(
        self,
        runs: Sequence[BenchmarkRun],
    ) -> BenchmarkResult:
        metric_values: dict[str, list[Decimal]] = {
            "latency_ms": [],
            "cost": [],
            "quality_score": [],
            "total_tokens": [],
            "throughput_tokens_per_second": [],
            "success_rate": [],
            "error_rate": [],
        }

        for run in runs:
            metrics = run.metrics

            metric_values["latency_ms"].append(
                metrics.latency_ms
            )
            metric_values["cost"].append(
                metrics.cost
            )
            metric_values["quality_score"].append(
                metrics.quality_score
            )
            metric_values["total_tokens"].append(
                _to_decimal(metrics.total_tokens)
            )
            metric_values["throughput_tokens_per_second"].append(
                metrics.throughput_tokens_per_second
            )
            metric_values["success_rate"].append(
                metrics.success_rate
            )
            metric_values["error_rate"].append(
                metrics.error_rate
            )

        summaries = {
            name: BenchmarkMetricSummary.from_values(values)
            for name, values in metric_values.items()
        }

        return BenchmarkResult(
            benchmark_name=self.name,
            runs=tuple(runs),
            metrics_summary=summaries,
        )


def create_benchmark(
    name: str,
    cases: Iterable[BenchmarkCase] | None = None,
) -> Benchmark:
    """Create a benchmark instance."""

    return Benchmark(name=name, cases=cases)


__all__ = [
    "BenchmarkCase",
    "BenchmarkRun",
    "BenchmarkResult",
    "Benchmark",
    "create_benchmark",
]
