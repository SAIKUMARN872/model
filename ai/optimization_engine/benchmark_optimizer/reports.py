from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any, Iterable, Mapping

from .benchmark import BenchmarkResult
from .utils import merge_metadata, normalize_text, validate_name


@dataclass(frozen=True)
class BenchmarkReport:
    name: str
    benchmark_id: str
    total_cases: int
    successful_cases: int
    failed_cases: int
    success_rate: Decimal
    error_rate: Decimal
    average_latency_ms: Decimal
    average_time_to_first_token_ms: Decimal
    average_throughput_tokens_per_second: Decimal
    average_cost: Decimal
    average_quality: Decimal
    total_input_tokens: int
    total_output_tokens: int
    total_tokens: int
    metadata: Mapping[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        object.__setattr__(self, "name", validate_name(self.name))

        if not normalize_text(self.benchmark_id):
            raise ValueError("benchmark_id cannot be empty")

        if self.total_cases < 0:
            raise ValueError("total_cases cannot be negative")

        if self.successful_cases < 0:
            raise ValueError("successful_cases cannot be negative")

        if self.failed_cases < 0:
            raise ValueError("failed_cases cannot be negative")

        object.__setattr__(self, "metadata", dict(self.metadata))

    @property
    def healthy(self) -> bool:
        return self.total_cases > 0 and self.success_rate > 0

    def as_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "benchmark_id": self.benchmark_id,
            "total_cases": self.total_cases,
            "successful_cases": self.successful_cases,
            "failed_cases": self.failed_cases,
            "success_rate": str(self.success_rate),
            "error_rate": str(self.error_rate),
            "average_latency_ms": str(self.average_latency_ms),
            "average_time_to_first_token_ms": str(
                self.average_time_to_first_token_ms
            ),
            "average_throughput_tokens_per_second": str(
                self.average_throughput_tokens_per_second
            ),
            "average_cost": str(self.average_cost),
            "average_quality": str(self.average_quality),
            "total_input_tokens": self.total_input_tokens,
            "total_output_tokens": self.total_output_tokens,
            "total_tokens": self.total_tokens,
            "healthy": self.healthy,
            "metadata": dict(self.metadata),
        }


class BenchmarkReporter:
    """Convert benchmark results into reports and compare reports."""

    def __init__(
        self,
        *,
        metadata: Mapping[str, Any] | None = None,
    ) -> None:
        self.metadata = dict(metadata or {})

    def create_report(
        self,
        result: BenchmarkResult,
        *,
        metadata: Mapping[str, Any] | None = None,
    ) -> BenchmarkReport:
        if not isinstance(result, BenchmarkResult):
            raise TypeError("result must be a BenchmarkResult")

        combined_metadata = merge_metadata(
            self.metadata,
            result.metadata,
        )

        if metadata:
            combined_metadata = merge_metadata(
                combined_metadata,
                metadata,
            )

        summary = result.summary

        return BenchmarkReport(
            name=result.name,
            benchmark_id=result.benchmark_id,
            total_cases=summary.sample_count,
            successful_cases=summary.successful_count,
            failed_cases=summary.failed_count,
            success_rate=summary.success_rate,
            error_rate=summary.error_rate,
            average_latency_ms=summary.average_latency_ms,
            average_time_to_first_token_ms=(
                summary.average_time_to_first_token_ms
            ),
            average_throughput_tokens_per_second=(
                summary.average_throughput_tokens_per_second
            ),
            average_cost=summary.average_cost,
            average_quality=summary.average_quality,
            total_input_tokens=summary.total_input_tokens,
            total_output_tokens=summary.total_output_tokens,
            total_tokens=summary.total_tokens,
            metadata=combined_metadata,
        )

    def report_many(
        self,
        results: Iterable[BenchmarkResult],
    ) -> list[BenchmarkReport]:
        return [
            self.create_report(result)
            for result in results
        ]

    @staticmethod
    def compare(
        reports: Iterable[BenchmarkReport],
    ) -> dict[str, Any]:
        items = list(reports)

        if not items:
            return {
                "reports": [],
                "best_quality": None,
                "best_latency": None,
                "best_cost": None,
                "best_reliability": None,
            }

        best_quality = max(
            items,
            key=lambda report: report.average_quality,
        )

        best_latency = min(
            items,
            key=lambda report: report.average_latency_ms,
        )

        best_cost = min(
            items,
            key=lambda report: report.average_cost,
        )

        best_reliability = max(
            items,
            key=lambda report: report.success_rate,
        )

        return {
            "reports": [
                report.as_dict()
                for report in items
            ],
            "best_quality": best_quality.name,
            "best_latency": best_latency.name,
            "best_cost": best_cost.name,
            "best_reliability": best_reliability.name,
        }


def create_report(
    result: BenchmarkResult,
    *,
    metadata: Mapping[str, Any] | None = None,
) -> BenchmarkReport:
    return BenchmarkReporter().create_report(
        result,
        metadata=metadata,
    )


def compare_reports(
    reports: Iterable[BenchmarkReport],
) -> dict[str, Any]:
    return BenchmarkReporter.compare(reports)


__all__ = [
    "BenchmarkReport",
    "BenchmarkReporter",
    "create_report",
    "compare_reports",
]
