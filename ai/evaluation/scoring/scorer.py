"""
Weighted scoring engine.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .weights import (
    DEFAULT_WEIGHTS,
    WeightSet,
)


@dataclass
class MetricScore:
    """Calculated score for one metric."""

    name: str
    raw_value: float
    normalized_value: float
    weight: float
    contribution: float
    higher_is_better: bool

    def to_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "raw_value": self.raw_value,
            "normalized_value":
                self.normalized_value,
            "weight": self.weight,
            "contribution":
                self.contribution,
            "higher_is_better":
                self.higher_is_better,
        }


@dataclass
class ScoreResult:
    """Complete scoring result."""

    score: float
    percentage: float
    metrics: list[MetricScore]
    passed: bool
    threshold: float
    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:
        return {
            "score": self.score,
            "percentage": self.percentage,
            "passed": self.passed,
            "threshold": self.threshold,
            "metrics": [
                metric.to_dict()
                for metric in self.metrics
            ],
            "metadata": dict(self.metadata),
        }


class Scorer:
    """
    Calculates a weighted final score.

    Metric values should normally be between 0 and 1.
    """

    def __init__(
        self,
        weights: WeightSet | None = None,
        threshold: float = 0.70,
    ) -> None:

        self.weights = (
            weights
            or WeightSet(
                weights=dict(
                    DEFAULT_WEIGHTS.weights
                ),
                directions=dict(
                    DEFAULT_WEIGHTS.directions
                ),
            )
        )

        self.threshold = float(threshold)

        self._validate_threshold(
            self.threshold
        )

    @staticmethod
    def _validate_threshold(
        threshold: float,
    ) -> None:

        if not 0 <= threshold <= 1:
            raise ValueError(
                "Threshold must be between 0 and 1."
            )

    @staticmethod
    def normalize(
        value: float,
    ) -> float:

        value = float(value)

        if value != value:
            return 0.0

        return max(
            0.0,
            min(1.0, value),
        )

    def score(
        self,
        metrics: dict[str, float],
        threshold: float | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> ScoreResult:

        if not metrics:
            return ScoreResult(
                score=0.0,
                percentage=0.0,
                metrics=[],
                passed=False,
                threshold=(
                    self.threshold
                    if threshold is None
                    else threshold
                ),
                metadata=metadata or {},
            )

        normalized_weights = (
            self.weights.normalized()
        )

        calculated: list[
            MetricScore
        ] = []

        weighted_total = 0.0
        used_weight = 0.0

        for name, weight in (
            normalized_weights.items()
        ):

            if name not in metrics:
                continue

            raw_value = float(
                metrics[name]
            )

            normalized = self.normalize(
                raw_value
            )

            higher_is_better = (
                self.weights.is_higher_better(
                    name
                )
            )

            if not higher_is_better:
                normalized = 1.0 - normalized

            contribution = (
                normalized * weight
            )

            weighted_total += contribution
            used_weight += weight

            calculated.append(
                MetricScore(
                    name=name,
                    raw_value=raw_value,
                    normalized_value=normalized,
                    weight=weight,
                    contribution=contribution,
                    higher_is_better=
                        higher_is_better,
                )
            )

        final_score = (
            weighted_total / used_weight
            if used_weight > 0
            else 0.0
        )

        final_threshold = (
            self.threshold
            if threshold is None
            else float(threshold)
        )

        self._validate_threshold(
            final_threshold
        )

        return ScoreResult(
            score=final_score,
            percentage=final_score * 100.0,
            metrics=calculated,
            passed=(
                final_score
                >= final_threshold
            ),
            threshold=final_threshold,
            metadata=metadata or {},
        )

    def score_single(
        self,
        metric: str,
        value: float,
    ) -> float:

        result = self.normalize(value)

        if not self.weights.is_higher_better(
            metric
        ):
            result = 1.0 - result

        return result

    def compare(
        self,
        first: dict[str, float],
        second: dict[str, float],
    ) -> dict[str, float]:

        metrics = set(first) & set(second)

        return {
            metric:
                float(first[metric])
                - float(second[metric])
            for metric in metrics
        }