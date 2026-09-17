"""
AI response quality grading.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable


@dataclass
class Grade:
    """Individual quality grade."""

    score: float

    criteria: dict[str, float] = field(
        default_factory=dict
    )

    explanation: str = ""

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        if not 0 <= self.score <= 1:

            raise ValueError(
                "score must be between 0 and 1."
            )


class QualityGrader:
    """
    Grades AI responses using configurable criteria.
    """

    DEFAULT_WEIGHTS = {
        "correctness": 0.30,
        "relevance": 0.25,
        "clarity": 0.20,
        "completeness": 0.15,
        "safety": 0.10,
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
                "Quality weights cannot be empty."
            )

        if any(
            value < 0
            for value in self.weights.values()
        ):

            raise ValueError(
                "Quality weights cannot be negative."
            )

    def grade(
        self,
        criteria_scores: dict[str, float],
        explanation: str = "",
    ) -> Grade:

        weighted_score = 0.0

        total_weight = 0.0

        normalized = {}

        for criterion, weight in self.weights.items():

            if criterion not in criteria_scores:
                continue

            score = float(
                criteria_scores[criterion]
            )

            if not 0 <= score <= 1:

                raise ValueError(
                    f"Score for '{criterion}' "
                    "must be between 0 and 1."
                )

            normalized[
                criterion
            ] = score

            weighted_score += (
                score * weight
            )

            total_weight += weight

        if total_weight == 0:

            final_score = 0.0

        else:

            final_score = (
                weighted_score
                / total_weight
            )

        return Grade(
            score=final_score,
            criteria=normalized,
            explanation=explanation,
        )

    def grade_with_function(
        self,
        prediction: Any,
        expected: Any,
        grader: Callable[
            [Any, Any],
            dict[str, float],
        ],
    ) -> Grade:

        scores = grader(
            prediction,
            expected,
        )

        return self.grade(
            scores
        )