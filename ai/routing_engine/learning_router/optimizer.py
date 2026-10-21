from __future__ import annotations

from dataclasses import dataclass

from .feedback import RoutingFeedback


@dataclass(frozen=True)
class ModelLearningScore:
    model_id: str
    samples: int
    success_rate: float
    average_quality: float
    average_latency_ms: float
    average_cost: float
    learning_score: float


class LearningOptimizer:
    def __init__(
        self,
        quality_weight: float = 0.50,
        latency_weight: float = 0.20,
        cost_weight: float = 0.15,
        success_weight: float = 0.15,
    ) -> None:
        weights = (
            quality_weight,
            latency_weight,
            cost_weight,
            success_weight,
        )

        if any(float(weight) < 0.0 for weight in weights):
            raise ValueError(
                "learning weights cannot be negative"
            )

        if sum(weights) <= 0.0:
            raise ValueError(
                "learning weights must have a positive total"
            )

        self.quality_weight = float(quality_weight)
        self.latency_weight = float(latency_weight)
        self.cost_weight = float(cost_weight)
        self.success_weight = float(success_weight)

    def score(
        self,
        feedback: list[RoutingFeedback],
        model_id: str,
    ) -> ModelLearningScore:
        model_feedback = [
            item
            for item in feedback
            if item.model_id == model_id
        ]

        if not model_feedback:
            raise ValueError(
                f"no feedback found for model: {model_id}"
            )

        samples = len(model_feedback)

        success_rate = sum(
            1 for item in model_feedback if item.success
        ) / samples

        average_quality = sum(
            item.quality_score
            for item in model_feedback
        ) / samples

        average_latency = sum(
            item.latency_ms
            for item in model_feedback
        ) / samples

        average_cost = sum(
            item.cost
            for item in model_feedback
        ) / samples

        latency_score = self._inverse_metric(
            average_latency,
            [item.latency_ms for item in feedback],
        )

        cost_score = self._inverse_metric(
            average_cost,
            [item.cost for item in feedback],
        )

        total_weight = (
            self.quality_weight
            + self.latency_weight
            + self.cost_weight
            + self.success_weight
        )

        learning_score = (
            average_quality * self.quality_weight
            + latency_score * self.latency_weight
            + cost_score * self.cost_weight
            + success_rate * self.success_weight
        ) / total_weight

        return ModelLearningScore(
            model_id=model_id,
            samples=samples,
            success_rate=success_rate,
            average_quality=average_quality,
            average_latency_ms=average_latency,
            average_cost=average_cost,
            learning_score=max(
                0.0,
                min(1.0, learning_score),
            ),
        )

    def rank(
        self,
        feedback: list[RoutingFeedback],
        model_ids: list[str] | None = None,
    ) -> list[ModelLearningScore]:
        if model_ids is None:
            model_ids = list(
                dict.fromkeys(
                    item.model_id
                    for item in feedback
                )
            )

        scores = []

        for model_id in model_ids:
            try:
                scores.append(
                    self.score(feedback, model_id)
                )
            except ValueError:
                continue

        return sorted(
            scores,
            key=lambda item: item.learning_score,
            reverse=True,
        )

    def best_model(
        self,
        feedback: list[RoutingFeedback],
        model_ids: list[str] | None = None,
    ) -> str | None:
        ranked = self.rank(feedback, model_ids)

        if not ranked:
            return None

        return ranked[0].model_id

    @staticmethod
    def _inverse_metric(
        value: float,
        values: list[float],
    ) -> float:
        if not values:
            return 0.0

        minimum = min(values)
        maximum = max(values)

        if maximum == minimum:
            return 1.0

        score = (
            maximum - float(value)
        ) / (
            maximum - minimum
        )

        return max(
            0.0,
            min(1.0, score),
        )


__all__ = [
    "LearningOptimizer",
    "ModelLearningScore",
]
