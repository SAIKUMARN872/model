from __future__ import annotations

from dataclasses import dataclass

from .metrics import QualityMetrics, QualityWeights, weighted_quality_score


@dataclass(frozen=True)
class QualityScore:
    score: float
    grade: str
    metrics: QualityMetrics
    pass_threshold: float = 0.70

    @property
    def passed(self) -> bool:
        return self.score >= self.pass_threshold


class QualityScorer:
    def __init__(
        self,
        weights: QualityWeights | None = None,
        pass_threshold: float = 0.70,
    ) -> None:
        if not 0.0 <= pass_threshold <= 1.0:
            raise ValueError("pass_threshold must be between 0.0 and 1.0")

        self._weights = weights or QualityWeights()
        self._pass_threshold = pass_threshold

    @property
    def weights(self) -> QualityWeights:
        return self._weights

    @property
    def pass_threshold(self) -> float:
        return self._pass_threshold

    def score(self, metrics: QualityMetrics) -> QualityScore:
        if not isinstance(metrics, QualityMetrics):
            raise TypeError(
                "metrics must be a QualityMetrics instance"
            )

        value = weighted_quality_score(
            metrics,
            self._weights,
        )

        return QualityScore(
            score=value,
            grade=self.grade(value),
            metrics=metrics,
            pass_threshold=self._pass_threshold,
        )

    def grade(self, score: float) -> str:
        value = float(score)

        if not 0.0 <= value <= 1.0:
            raise ValueError("score must be between 0.0 and 1.0")

        if value >= 0.90:
            return "excellent"

        if value >= 0.80:
            return "good"

        if value >= 0.70:
            return "acceptable"

        if value >= 0.50:
            return "poor"

        return "critical"


__all__ = [
    "QualityScore",
    "QualityScorer",
]
