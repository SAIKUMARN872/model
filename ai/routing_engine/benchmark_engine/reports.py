from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Iterable

from .benchmark import BenchmarkResult
from .performance import ModelPerformance, PerformanceAnalyzer


@dataclass(frozen=True)
class BenchmarkReport:
    total_results: int
    successful_results: int
    failed_results: int
    models_evaluated: int
    average_quality: float
    average_latency_ms: float
    average_cost: float
    best_quality_model: str | None = None
    best_latency_model: str | None = None
    best_cost_model: str | None = None
    model_performance: tuple[ModelPerformance, ...] = ()
    metadata: dict[str, Any] = field(default_factory=dict)


class ReportGenerator:
    def __init__(
        self,
        analyzer: PerformanceAnalyzer | None = None,
    ) -> None:
        self._analyzer = analyzer or PerformanceAnalyzer()

    @property
    def analyzer(self) -> PerformanceAnalyzer:
        return self._analyzer

    def generate(
        self,
        results: Iterable[BenchmarkResult],
    ) -> BenchmarkReport:
        normalized = list(results)

        for result in normalized:
            if not isinstance(result, BenchmarkResult):
                raise TypeError(
                    "all results must be BenchmarkResult instances"
                )

        total_results = len(normalized)

        if total_results == 0:
            return BenchmarkReport(
                total_results=0,
                successful_results=0,
                failed_results=0,
                models_evaluated=0,
                average_quality=0.0,
                average_latency_ms=0.0,
                average_cost=0.0,
            )

        successful_results = sum(
            1 for result in normalized if result.success
        )

        failed_results = total_results - successful_results

        average_quality = sum(
            result.quality_score for result in normalized
        ) / total_results

        average_latency_ms = sum(
            result.latency_ms for result in normalized
        ) / total_results

        average_cost = sum(
            result.cost for result in normalized
        ) / total_results

        performances = tuple(
            self._analyzer.analyze(normalized)
        )

        best_quality = self._analyzer.best_by_quality(normalized)
        best_latency = self._analyzer.best_by_latency(normalized)
        best_cost = self._analyzer.best_by_cost(normalized)

        return BenchmarkReport(
            total_results=total_results,
            successful_results=successful_results,
            failed_results=failed_results,
            models_evaluated=len(performances),
            average_quality=average_quality,
            average_latency_ms=average_latency_ms,
            average_cost=average_cost,
            best_quality_model=(
                best_quality.model_id if best_quality else None
            ),
            best_latency_model=(
                best_latency.model_id if best_latency else None
            ),
            best_cost_model=(
                best_cost.model_id if best_cost else None
            ),
            model_performance=performances,
        )


__all__ = [
    "BenchmarkReport",
    "ReportGenerator",
]
