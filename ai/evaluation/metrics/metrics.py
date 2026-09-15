"""
Combined AI evaluation metrics.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .accuracy import (
    AccuracyMetric,
    AccuracyMetrics,
)

from .cost import (
    CostMetric,
    CostMetrics,
)

from .latency import (
    LatencyMetric,
    LatencyMetrics,
)


@dataclass
class EvaluationMetrics:
    """Combined evaluation metrics."""

    accuracy: AccuracyMetrics | None = None

    cost: CostMetrics | None = None

    latency: LatencyMetrics | None = None

    def overall_score(
        self,
        accuracy_weight: float = 0.5,
        cost_weight: float = 0.2,
        latency_weight: float = 0.3,
    ) -> float:

        weights = (
            accuracy_weight,
            cost_weight,
            latency_weight,
        )

        if any(
            weight < 0
            for weight in weights
        ):

            raise ValueError(
                "Metric weights cannot be negative."
            )

        total_weight = sum(
            weights
        )

        if total_weight == 0:
            return 0.0

        score = 0.0

        if self.accuracy:

            score += (
                self.accuracy.accuracy
                * accuracy_weight
            )

        if self.cost:

            cost_score = 1.0 / (
                1.0
                + self.cost.average_cost
            )

            score += (
                cost_score
                * cost_weight
            )

        if self.latency:

            latency_score = 1.0 / (
                1.0
                + (
                    self.latency.average_ms
                    / 1000
                )
            )

            score += (
                latency_score
                * latency_weight
            )

        return score / total_weight

    def to_dict(
        self,
    ) -> dict[str, Any]:

        return {
            "accuracy":
                (
                    self.accuracy.to_dict()
                    if self.accuracy
                    else None
                ),
            "cost":
                (
                    self.cost.to_dict()
                    if self.cost
                    else None
                ),
            "latency":
                (
                    self.latency.to_dict()
                    if self.latency
                    else None
                ),
            "overall_score":
                self.overall_score(),
        }


class MetricsCalculator:
    """Calculates all supported metrics."""

    def calculate_accuracy(
        self,
        predictions: list[Any],
        expected: list[Any],
    ) -> AccuracyMetrics:

        return AccuracyMetric.calculate(
            predictions,
            expected,
        )

    def calculate_cost(
        self,
        costs: list[float],
        input_tokens: list[int] | None = None,
        output_tokens: list[int] | None = None,
    ) -> CostMetrics:

        return CostMetric.calculate(
            costs,
            input_tokens,
            output_tokens,
        )

    def calculate_latency(
        self,
        latencies_ms: list[float],
    ) -> LatencyMetrics:

        return LatencyMetric.calculate(
            latencies_ms
        )

    def calculate(
        self,
        predictions: list[Any],
        expected: list[Any],
        costs: list[float] | None = None,
        latencies_ms: list[float] | None = None,
        input_tokens: list[int] | None = None,
        output_tokens: list[int] | None = None,
    ) -> EvaluationMetrics:

        accuracy = self.calculate_accuracy(
            predictions,
            expected,
        )

        cost = (
            self.calculate_cost(
                costs,
                input_tokens,
                output_tokens,
            )
            if costs is not None
            else None
        )

        latency = (
            self.calculate_latency(
                latencies_ms
            )
            if latencies_ms is not None
            else None
        )

        return EvaluationMetrics(
            accuracy=accuracy,
            cost=cost,
            latency=latency,
        )