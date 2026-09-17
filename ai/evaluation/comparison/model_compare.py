"""
AI model comparison.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .compare import (
    Comparator,
    ComparisonResult,
)


@dataclass
class ModelComparison:
    """Metrics for one model."""

    model_name: str

    accuracy: float = 0.0

    latency_ms: float = 0.0

    cost: float = 0.0

    quality: float = 0.0

    reliability: float = 0.0

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def metrics(
        self,
    ) -> dict[str, float]:

        return {
            "accuracy": self.accuracy,
            "latency_ms": self.latency_ms,
            "cost": self.cost,
            "quality": self.quality,
            "reliability": self.reliability,
        }


@dataclass
class ModelComparisonResult:
    """Comparison result for two models."""

    first: ModelComparison

    second: ModelComparison

    metrics: dict[
        str,
        ComparisonResult,
    ]

    winner: str | None


class ModelComparator:
    """Compares AI models across multiple metrics."""

    def __init__(
        self,
    ) -> None:

        self.comparator = Comparator()

    def compare(
        self,
        first: ModelComparison,
        second: ModelComparison,
    ) -> ModelComparisonResult:

        directions = {
            "accuracy": True,
            "latency_ms": False,
            "cost": False,
            "quality": True,
            "reliability": True,
        }

        results = self.comparator.compare_metrics(
            first.model_name,
            first.metrics(),
            second.model_name,
            second.metrics(),
            directions,
        )

        first_wins = 0
        second_wins = 0

        for result in results.values():

            if result.winner == first.model_name:

                first_wins += 1

            elif result.winner == second.model_name:

                second_wins += 1

        if first_wins > second_wins:

            winner = first.model_name

        elif second_wins > first_wins:

            winner = second.model_name

        else:

            winner = None

        return ModelComparisonResult(
            first=first,
            second=second,
            metrics=results,
            winner=winner,
        )