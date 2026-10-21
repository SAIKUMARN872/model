from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Iterable, List

from ..models import OptimizationCandidate
from .utils import validate_quality


@dataclass(frozen=True)
class QualityScore:
    """Quality score assigned to an optimization candidate."""

    model: str
    provider: str
    quality_score: Decimal
    latency_ms: Decimal
    cost: Decimal


class QualityScorer:
    """Score and rank candidates by predicted quality."""

    def score(
        self,
        candidate: OptimizationCandidate,
    ) -> QualityScore:
        """Create a quality score for one candidate."""
        return QualityScore(
            model=candidate.model,
            provider=candidate.provider,
            quality_score=validate_quality(
                candidate.quality_score
            ),
            latency_ms=candidate.estimated_latency_ms,
            cost=candidate.estimated_cost,
        )

    def rank(
        self,
        candidates: Iterable[OptimizationCandidate],
    ) -> List[OptimizationCandidate]:
        """Rank candidates from highest to lowest quality."""
        return sorted(
            candidates,
            key=lambda candidate: (
                validate_quality(
                    candidate.quality_score
                ),
                -candidate.estimated_latency_ms,
                -candidate.estimated_cost,
            ),
            reverse=True,
        )

    def best(
        self,
        candidates: Iterable[OptimizationCandidate],
    ) -> OptimizationCandidate:
        """Return the highest-quality candidate."""
        candidates_list = list(candidates)

        if not candidates_list:
            raise ValueError(
                "candidates must not be empty"
            )

        return self.rank(
            candidates_list
        )[0]


class WeightedQualityScorer:
    """Score quality while considering latency and cost penalties."""

    def __init__(
        self,
        quality_weight: Decimal | int | float | str = Decimal("1"),
        latency_weight: Decimal | int | float | str = Decimal("0"),
        cost_weight: Decimal | int | float | str = Decimal("0"),
    ) -> None:
        self.quality_weight = Decimal(
            str(quality_weight)
        )
        self.latency_weight = Decimal(
            str(latency_weight)
        )
        self.cost_weight = Decimal(
            str(cost_weight)
        )

        if self.quality_weight < Decimal("0"):
            raise ValueError(
                "quality_weight must not be negative"
            )

        if self.latency_weight < Decimal("0"):
            raise ValueError(
                "latency_weight must not be negative"
            )

        if self.cost_weight < Decimal("0"):
            raise ValueError(
                "cost_weight must not be negative"
            )

    def score(
        self,
        candidate: OptimizationCandidate,
    ) -> Decimal:
        """Calculate a weighted quality score."""
        quality = validate_quality(
            candidate.quality_score
        )

        latency = Decimal(
            str(candidate.estimated_latency_ms)
        )

        cost = Decimal(
            str(candidate.estimated_cost)
        )

        if latency < Decimal("0"):
            raise ValueError(
                "candidate latency must not be negative"
            )

        if cost < Decimal("0"):
            raise ValueError(
                "candidate cost must not be negative"
            )

        return (
            self.quality_weight * quality
            - self.latency_weight * latency
            - self.cost_weight * cost
        )


__all__ = [
    "QualityScore",
    "QualityScorer",
    "WeightedQualityScorer",
]
