"""
AI model ranking.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .model_compare import (
    ModelComparison,
)


@dataclass
class ModelRanking:
    """Ranked model result."""

    rank: int

    model_name: str

    score: float

    metrics: dict[str, float]


class RankingEngine:
    """
    Ranks models using weighted evaluation metrics.
    """

    DEFAULT_WEIGHTS = {
        "accuracy": 0.30,
        "quality": 0.30,
        "reliability": 0.20,
        "latency_ms": 0.10,
        "cost": 0.10,
    }

    def __init__(
        self,
        weights: dict[str, float] | None = None,
    ) -> None:

        self.weights = (
            weights
            or dict(
                self.DEFAULT_WEIGHTS
            )
        )

        self._validate_weights()

    def _validate_weights(self) -> None:

        if not self.weights:

            raise ValueError(
                "At least one ranking weight is required."
            )

        total = sum(
            self.weights.values()
        )

        if total <= 0:

            raise ValueError(
                "Ranking weights must have a positive total."
            )

    def rank(
        self,
        models: list[ModelComparison],
    ) -> list[ModelRanking]:

        if not models:
            return []

        normalized = {}

        for model in models:

            normalized[
                model.model_name
            ] = self._normalize_metrics(
                model,
                models,
            )

        scores = []

        for model in models:

            metrics = normalized[
                model.model_name
            ]

            score = 0.0

            for metric, weight in self.weights.items():

                score += (
                    metrics.get(
                        metric,
                        0.0,
                    )
                    * weight
                )

            scores.append(
                (
                    model.model_name,
                    score,
                    metrics,
                )
            )

        scores.sort(
            key=lambda item: item[1],
            reverse=True,
        )

        return [
            ModelRanking(
                rank=index + 1,
                model_name=name,
                score=score,
                metrics=metrics,
            )
            for index, (
                name,
                score,
                metrics,
            ) in enumerate(scores)
        ]

    def _normalize_metrics(
        self,
        model: ModelComparison,
        models: list[ModelComparison],
    ) -> dict[str, float]:

        raw = model.metrics()

        normalized: dict[
            str,
            float,
        ] = {}

        higher_is_better = {
            "accuracy": True,
            "quality": True,
            "reliability": True,
            "latency_ms": False,
            "cost": False,
        }

        for metric, value in raw.items():

            all_values = [
                item.metrics().get(
                    metric,
                    0.0,
                )
                for item in models
            ]

            minimum = min(
                all_values
            )

            maximum = max(
                all_values
            )

            if maximum == minimum:

                normalized[metric] = 1.0

                continue

            if higher_is_better.get(
                metric,
                True,
            ):

                score = (
                    value - minimum
                ) / (
                    maximum - minimum
                )

            else:

                score = (
                    maximum - value
                ) / (
                    maximum - minimum
                )

            normalized[metric] = max(
                0.0,
                min(
                    score,
                    1.0,
                ),
            )

        return normalized