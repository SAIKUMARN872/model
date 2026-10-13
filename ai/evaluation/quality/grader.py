"""Quality grader with configurable acceptance threshold."""

from typing import Any

from .quality import evaluate_quality
from .rating import QualityRating, rate_quality


class QualityGrader:
    """Evaluate answer quality and assign a threshold-based rating."""

    def __init__(self, threshold: float = 0.7) -> None:
        # Validate the configured threshold during initialization.
        rate_quality(0.0, threshold)
        self.threshold = float(threshold)

    def grade(
        self,
        answer: str,
        reference: str | None = None,
        context: str | None = None,
        required_points: list[str] | tuple[str, ...] | None = None,
        question: str | None = None,
    ) -> dict[str, Any]:
        evaluation = evaluate_quality(
            answer=answer,
            reference=reference,
            context=context,
            required_points=required_points,
            question=question,
        )
        rating: QualityRating = rate_quality(
            evaluation["quality_score"], self.threshold
        )
        evaluation["rating"] = {
            "score": rating.score,
            "label": rating.label,
            "passed": rating.passed,
            "threshold": rating.threshold,
        }
        return evaluation


def grade_answer(
    answer: str,
    reference: str | None = None,
    context: str | None = None,
    required_points: list[str] | tuple[str, ...] | None = None,
    question: str | None = None,
    threshold: float = 0.7,
) -> dict[str, Any]:
    """Convenience function for grading a single answer."""
    return QualityGrader(threshold=threshold).grade(
        answer=answer,
        reference=reference,
        context=context,
        required_points=required_points,
        question=question,
    )
