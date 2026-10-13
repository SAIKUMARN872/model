from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any, Dict, Iterable, List

from ..models import OptimizationCandidate
from .scorer import QualityScorer
from .utils import (
    validate_quality,
)


@dataclass(frozen=True)
class QualityEvaluation:
    """Evaluation result for one model/provider candidate."""

    model: str
    provider: str
    quality_score: Decimal
    meets_requirement: bool
    quality_gap: Decimal
    rank: int
    metadata: Dict[str, Any] = field(
        default_factory=dict
    )


class QualityEvaluator:
    """Evaluate model candidates using quality scores."""

    def __init__(
        self,
        scorer: QualityScorer | None = None,
    ) -> None:
        self.scorer = (
            scorer
            if scorer is not None
            else QualityScorer()
        )

    def evaluate(
        self,
        candidate: OptimizationCandidate,
        min_quality_score: Decimal | int | float | str | None = None,
        rank: int = 1,
    ) -> QualityEvaluation:
        """Evaluate a single candidate."""
        quality = validate_quality(
            candidate.quality_score
        )

        if min_quality_score is None:
            meets_requirement = True
            quality_gap = Decimal("0")
        else:
            minimum = validate_quality(
                min_quality_score
            )

            meets_requirement = (
                quality >= minimum
            )

            quality_gap = max(
                Decimal("0"),
                minimum - quality,
            )

        return QualityEvaluation(
            model=candidate.model,
            provider=candidate.provider,
            quality_score=quality,
            meets_requirement=meets_requirement,
            quality_gap=quality_gap,
            rank=rank,
        )

    def evaluate_all(
        self,
        candidates: Iterable[OptimizationCandidate],
        min_quality_score: Decimal | int | float | str | None = None,
    ) -> List[QualityEvaluation]:
        """Evaluate and rank all candidates."""
        ranked = self.scorer.rank(
            candidates
        )

        return [
            self.evaluate(
                candidate,
                min_quality_score=min_quality_score,
                rank=index,
            )
            for index, candidate in enumerate(
                ranked,
                start=1,
            )
        ]

    def best(
        self,
        candidates: Iterable[OptimizationCandidate],
        min_quality_score: Decimal | int | float | str | None = None,
    ) -> QualityEvaluation:
        """Return the best quality candidate evaluation."""
        evaluations = self.evaluate_all(
            candidates,
            min_quality_score=min_quality_score,
        )

        if not evaluations:
            raise ValueError(
                "candidates must not be empty"
            )

        for evaluation in evaluations:
            if evaluation.meets_requirement:
                return evaluation

        return evaluations[0]


__all__ = [
    "QualityEvaluation",
    "QualityEvaluator",
]
