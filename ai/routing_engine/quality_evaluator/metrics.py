from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class QualityMetrics:
    """Normalized quality signals for a model response."""

    relevance: float = 0.0
    correctness: float = 0.0
    completeness: float = 0.0
    coherence: float = 0.0
    latency: float = 0.0
    cost_efficiency: float = 0.0

    def __post_init__(self) -> None:
        values = {
            "relevance": self.relevance,
            "correctness": self.correctness,
            "completeness": self.completeness,
            "coherence": self.coherence,
            "latency": self.latency,
            "cost_efficiency": self.cost_efficiency,
        }

        for name, value in values.items():
            if not 0.0 <= float(value) <= 1.0:
                raise ValueError(
                    f"{name} must be between 0.0 and 1.0"
                )

    @property
    def average(self) -> float:
        """Return the arithmetic mean of all quality signals."""
        values = (
            self.relevance,
            self.correctness,
            self.completeness,
            self.coherence,
            self.latency,
            self.cost_efficiency,
        )

        return sum(values) / len(values)


@dataclass(frozen=True)
class QualityWeights:
    """Weights used to combine quality metrics."""

    relevance: float = 0.25
    correctness: float = 0.25
    completeness: float = 0.20
    coherence: float = 0.10
    latency: float = 0.10
    cost_efficiency: float = 0.10

    def __post_init__(self) -> None:
        values = (
            self.relevance,
            self.correctness,
            self.completeness,
            self.coherence,
            self.latency,
            self.cost_efficiency,
        )

        if any(float(value) < 0.0 for value in values):
            raise ValueError(
                "quality weights cannot be negative"
            )

        if sum(values) <= 0.0:
            raise ValueError(
                "quality weights must have a positive total"
            )

    @property
    def total(self) -> float:
        return (
            self.relevance
            + self.correctness
            + self.completeness
            + self.coherence
            + self.latency
            + self.cost_efficiency
        )


def normalize_score(value: float) -> float:
    """Clamp a quality score into the normalized 0..1 range."""
    return max(0.0, min(1.0, float(value)))


def weighted_quality_score(
    metrics: QualityMetrics,
    weights: QualityWeights | None = None,
) -> float:
    """Calculate a weighted normalized quality score."""
    if not isinstance(metrics, QualityMetrics):
        raise TypeError(
            "metrics must be a QualityMetrics instance"
        )

    weights = weights or QualityWeights()

    score = (
        metrics.relevance * weights.relevance
        + metrics.correctness * weights.correctness
        + metrics.completeness * weights.completeness
        + metrics.coherence * weights.coherence
        + metrics.latency * weights.latency
        + metrics.cost_efficiency * weights.cost_efficiency
    )

    return normalize_score(score / weights.total)


__all__ = [
    "QualityMetrics",
    "QualityWeights",
    "normalize_score",
    "weighted_quality_score",
]
