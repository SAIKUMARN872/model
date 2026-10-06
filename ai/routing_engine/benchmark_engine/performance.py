from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from .benchmark import BenchmarkResult


@dataclass(frozen=True)
class ModelPerformance:
    model_id: str
    provider: str
    tier: str
    samples: int
    success_rate: float
    average_quality: float
    average_latency_ms: float
    average_cost: float


class PerformanceAnalyzer:
    def analyze(
        self,
        results: Iterable[BenchmarkResult],
    ) -> list[ModelPerformance]:
        grouped: dict[str, list[BenchmarkResult]] = {}

        for result in results:
            if not isinstance(result, BenchmarkResult):
                raise TypeError(
                    "all results must be BenchmarkResult instances"
                )

            grouped.setdefault(result.model_id, []).append(result)

        performances: list[ModelPerformance] = []

        for model_id, model_results in grouped.items():
            samples = len(model_results)

            success_rate = sum(
                1 for result in model_results if result.success
            ) / samples

            average_quality = sum(
                result.quality_score
                for result in model_results
            ) / samples

            average_latency_ms = sum(
                result.latency_ms
                for result in model_results
            ) / samples

            average_cost = sum(
                result.cost
                for result in model_results
            ) / samples

            first = model_results[0]

            performances.append(
                ModelPerformance(
                    model_id=model_id,
                    provider=first.provider,
                    tier=first.tier,
                    samples=samples,
                    success_rate=success_rate,
                    average_quality=average_quality,
                    average_latency_ms=average_latency_ms,
                    average_cost=average_cost,
                )
            )

        return performances

    def best_by_quality(
        self,
        results: Iterable[BenchmarkResult],
    ) -> ModelPerformance | None:
        performances = self.analyze(results)

        if not performances:
            return None

        return max(
            performances,
            key=lambda item: (
                item.average_quality,
                item.success_rate,
            ),
        )

    def best_by_latency(
        self,
        results: Iterable[BenchmarkResult],
    ) -> ModelPerformance | None:
        performances = self.analyze(results)

        if not performances:
            return None

        return min(
            performances,
            key=lambda item: (
                item.average_latency_ms,
                -item.success_rate,
            ),
        )

    def best_by_cost(
        self,
        results: Iterable[BenchmarkResult],
    ) -> ModelPerformance | None:
        performances = self.analyze(results)

        if not performances:
            return None

        return min(
            performances,
            key=lambda item: (
                item.average_cost,
                -item.success_rate,
            ),
        )


__all__ = [
    "ModelPerformance",
    "PerformanceAnalyzer",
]
