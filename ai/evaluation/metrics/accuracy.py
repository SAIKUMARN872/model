"""
Accuracy metrics for AI evaluation.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class AccuracyMetrics:
    """Accuracy evaluation result."""

    total: int
    correct: int
    accuracy: float

    @property
    def percentage(self) -> float:
        return self.accuracy * 100.0

    def to_dict(self) -> dict[str, Any]:
        return {
            "total": self.total,
            "correct": self.correct,
            "accuracy": self.accuracy,
            "percentage": self.percentage,
        }


class AccuracyMetric:
    """Calculates prediction accuracy."""

    @staticmethod
    def calculate(
        predictions: list[Any],
        expected: list[Any],
    ) -> AccuracyMetrics:

        if len(predictions) != len(expected):
            raise ValueError(
                "predictions and expected must have "
                "the same length."
            )

        total = len(predictions)

        correct = sum(
            prediction == target
            for prediction, target
            in zip(predictions, expected)
        )

        accuracy = (
            correct / total
            if total
            else 0.0
        )

        return AccuracyMetrics(
            total=total,
            correct=int(correct),
            accuracy=accuracy,
        )

    @staticmethod
    def exact_match(
        prediction: Any,
        expected: Any,
    ) -> float:

        return (
            1.0
            if prediction == expected
            else 0.0
        )

    @staticmethod
    def token_accuracy(
        prediction: str,
        expected: str,
    ) -> float:

        prediction_tokens = (
            str(prediction)
            .lower()
            .split()
        )

        expected_tokens = (
            str(expected)
            .lower()
            .split()
        )

        if not expected_tokens:
            return (
                1.0
                if not prediction_tokens
                else 0.0
            )

        matches = sum(
            token in expected_tokens
            for token in prediction_tokens
        )

        return min(
            matches / len(expected_tokens),
            1.0,
        )