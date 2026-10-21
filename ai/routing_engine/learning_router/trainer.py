from __future__ import annotations

from dataclasses import dataclass

from .feedback import RoutingFeedback
from .optimizer import LearningOptimizer, ModelLearningScore


@dataclass(frozen=True)
class TrainingResult:
    task_type: str
    samples: int
    models_considered: int
    best_model: str | None
    ranked_models: tuple[str, ...]


class LearningTrainer:
    def __init__(
        self,
        optimizer: LearningOptimizer | None = None,
        min_samples: int = 1,
    ) -> None:
        if min_samples <= 0:
            raise ValueError(
                "min_samples must be greater than zero"
            )

        self._optimizer = optimizer or LearningOptimizer()
        self._min_samples = int(min_samples)

    @property
    def optimizer(self) -> LearningOptimizer:
        return self._optimizer

    @property
    def min_samples(self) -> int:
        return self._min_samples

    def train(
        self,
        feedback: list[RoutingFeedback],
        task_type: str,
    ) -> TrainingResult:
        if not isinstance(feedback, list):
            raise TypeError(
                "feedback must be a list"
            )

        task_type = str(task_type).strip().lower()

        if not task_type:
            raise ValueError(
                "task_type cannot be empty"
            )

        task_feedback = [
            item
            for item in feedback
            if item.task_type.lower() == task_type
        ]

        if len(task_feedback) < self._min_samples:
            return TrainingResult(
                task_type=task_type,
                samples=len(task_feedback),
                models_considered=0,
                best_model=None,
                ranked_models=(),
            )

        model_ids = list(
            dict.fromkeys(
                item.model_id
                for item in task_feedback
            )
        )

        ranked = self._optimizer.rank(
            task_feedback,
            model_ids,
        )

        return TrainingResult(
            task_type=task_type,
            samples=len(task_feedback),
            models_considered=len(ranked),
            best_model=(
                ranked[0].model_id
                if ranked
                else None
            ),
            ranked_models=tuple(
                item.model_id
                for item in ranked
            ),
        )

    def train_all(
        self,
        feedback: list[RoutingFeedback],
    ) -> list[TrainingResult]:
        if not isinstance(feedback, list):
            raise TypeError(
                "feedback must be a list"
            )

        task_types = list(
            dict.fromkeys(
                item.task_type.lower()
                for item in feedback
            )
        )

        return [
            self.train(feedback, task_type)
            for task_type in task_types
        ]

    def scores(
        self,
        feedback: list[RoutingFeedback],
        task_type: str,
    ) -> list[ModelLearningScore]:
        task_type = str(task_type).strip().lower()

        task_feedback = [
            item
            for item in feedback
            if item.task_type.lower() == task_type
        ]

        model_ids = list(
            dict.fromkeys(
                item.model_id
                for item in task_feedback
            )
        )

        return self._optimizer.rank(
            task_feedback,
            model_ids,
        )


__all__ = [
    "LearningTrainer",
    "TrainingResult",
]
