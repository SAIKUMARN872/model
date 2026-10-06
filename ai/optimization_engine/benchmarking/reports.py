from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Any, Mapping

from .benchmark import BenchmarkResult


def _to_decimal(value: Decimal | int | float | str) -> Decimal:
    if isinstance(value, Decimal):
        return value
    return Decimal(str(value))


@dataclass(frozen=True)
class BenchmarkReport:
    """Serializable summary of a benchmark result."""

    benchmark_name: str
    total_cases: int
    successful_cases: int
    failed_cases: int
    success_rate: Decimal
    average_latency_ms: Decimal
    average_cost: Decimal
    average_quality_score: Decimal

    def to_dict(self) -> dict[str, Any]:
        return {
            "benchmark_name": self.benchmark_name,
            "total_cases": self.total_cases,
            "successful_cases": self.successful_cases,
            "failed_cases": self.failed_cases,
            "success_rate": str(self.success_rate),
            "average_latency_ms": str(self.average_latency_ms),
            "average_cost": str(self.average_cost),
            "average_quality_score": str(self.average_quality_score),
        }

    def to_text(self) -> str:
        return "\n".join(
            [
                f"Benchmark: {self.benchmark_name}",
                f"Total cases: {self.total_cases}",
                f"Successful cases: {self.successful_cases}",
                f"Failed cases: {self.failed_cases}",
                f"Success rate: {self.success_rate}",
                f"Average latency (ms): {self.average_latency_ms}",
                f"Average cost: {self.average_cost}",
                f"Average quality score: {self.average_quality_score}",
            ]
        )


class BenchmarkReporter:
    """Creates reports from benchmark results."""

    def create_report(
        self,
        result: BenchmarkResult,
    ) -> BenchmarkReport:
        if not isinstance(result, BenchmarkResult):
            raise TypeError("result must be a BenchmarkResult")

        return BenchmarkReport(
            benchmark_name=result.benchmark_name,
            total_cases=result.total_cases,
            successful_cases=result.successful_cases,
            failed_cases=result.failed_cases,
            success_rate=result.success_rate,
            average_latency_ms=result.average_latency_ms,
            average_cost=result.average_cost,
            average_quality_score=result.average_quality_score,
        )

    def to_dict(
        self,
        result: BenchmarkResult,
    ) -> dict[str, Any]:
        return self.create_report(result).to_dict()

    def to_text(
        self,
        result: BenchmarkResult,
    ) -> str:
        return self.create_report(result).to_text()


def compare_reports(
    baseline: BenchmarkReport,
    candidate: BenchmarkReport,
) -> dict[str, Decimal]:
    """Compare candidate metrics against a baseline.

    Positive values mean the candidate is numerically higher.
    For latency and cost, a negative delta is generally an improvement.
    """

    if not isinstance(baseline, BenchmarkReport):
        raise TypeError("baseline must be a BenchmarkReport")

    if not isinstance(candidate, BenchmarkReport):
        raise TypeError("candidate must be a BenchmarkReport")

    return {
        "success_rate_delta": (
            candidate.success_rate - baseline.success_rate
        ),
        "latency_delta_ms": (
            candidate.average_latency_ms
            - baseline.average_latency_ms
        ),
        "cost_delta": (
            candidate.average_cost
            - baseline.average_cost
        ),
        "quality_delta": (
            candidate.average_quality_score
            - baseline.average_quality_score
        ),
    }


def create_report(
    result: BenchmarkResult,
) -> BenchmarkReport:
    """Convenience factory for a benchmark report."""

    return BenchmarkReporter().create_report(result)


__all__ = [
    "BenchmarkReport",
    "BenchmarkReporter",
    "compare_reports",
    "create_report",
]
