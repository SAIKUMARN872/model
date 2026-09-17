"""
Accuracy evaluation.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .scorer import (
    Score,
    Scorer,
)
from .validation import (
    Validator,
)


@dataclass
class AccuracyResult:
    """Aggregate accuracy result."""

    accuracy: float

    total: int

    correct: int

    scores: list[Score] = field(
        default_factory=list
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    @property
    def percentage(self) -> float:

        return self.accuracy * 100


class AccuracyEvaluator:
    """Evaluates predictions against expected answers."""

    def __init__(
        self,
        scorer: Scorer | None = None,
        validator: Validator | None = None,
    ) -> None:

        self.scorer = (
            scorer
            or Scorer()
        )

        self.validator = (
            validator
            or Validator()
        )

    def evaluate(
        self,
        predictions: list[Any],
        expected: list[Any],
    ) -> AccuracyResult:

        validation = (
            self.validator.validate_dataset(
                predictions,
                expected,
            )
        )

        if not validation.valid:

            raise ValueError(
                "; ".join(
                    validation.errors
                )
            )

        scores: list[Score] = []

        for prediction, answer in zip(
            predictions,
            expected,
        ):

            scores.append(
                self.scorer.exact_match(
                    prediction,
                    answer,
                )
            )

        correct = sum(
            1
            for score in scores
            if score.value >= 1.0
        )

        total = len(
            scores
        )

        accuracy = (
            correct / total
            if total
            else 0.0
        )

        return AccuracyResult(
            accuracy=accuracy,
            total=total,
            correct=correct,
            scores=scores,
        )

    def evaluate_contains(
        self,
        predictions: list[str],
        expected: list[str],
    ) -> AccuracyResult:

        validation = (
            self.validator.validate_dataset(
                predictions,
                expected,
            )
        )

        if not validation.valid:

            raise ValueError(
                "; ".join(
                    validation.errors
                )
            )

        scores = [
            self.scorer.contains(
                prediction,
                answer,
            )
            for prediction, answer
            in zip(
                predictions,
                expected,
            )
        ]

        correct = sum(
            score.value >= 1.0
            for score in scores
        )

        total = len(
            scores
        )

        accuracy = (
            sum(
                score.value
                for score in scores
            )
            / total
            if total
            else 0.0
        )

        return AccuracyResult(
            accuracy=accuracy,
            total=total,
            correct=int(correct),
            scores=scores,
        )