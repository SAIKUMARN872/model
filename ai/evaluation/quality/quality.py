"""
Overall AI quality evaluation.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .grader import (
    Grade,
    QualityGrader,
)
from .rating import (
    Rating,
    create_rating,
)


@dataclass
class QualityResult:
    """Complete quality evaluation result."""

    grade: Grade

    rating: Rating

    passed: bool

    threshold: float

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(
        self,
    ) -> dict[str, Any]:

        return {
            "score":
                self.grade.score,
            "grade":
                self.grade.criteria,
            "rating":
                self.rating.to_dict(),
            "passed":
                self.passed,
            "threshold":
                self.threshold,
            "metadata":
                self.metadata,
        }


class QualityEvaluator:
    """Evaluates overall response quality."""

    def __init__(
        self,
        grader: QualityGrader | None = None,
        threshold: float = 0.70,
    ) -> None:

        if not 0 <= threshold <= 1:

            raise ValueError(
                "threshold must be between 0 and 1."
            )

        self.grader = (
            grader
            or QualityGrader()
        )

        self.threshold = threshold

    def evaluate(
        self,
        criteria_scores: dict[str, float],
        explanation: str = "",
    ) -> QualityResult:

        grade = self.grader.grade(
            criteria_scores,
            explanation,
        )

        rating = create_rating(
            grade.score,
            explanation,
        )

        return QualityResult(
            grade=grade,
            rating=rating,
            passed=(
                grade.score
                >= self.threshold
            ),
            threshold=self.threshold,
        )