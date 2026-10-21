from __future__ import annotations

from decimal import Decimal
from typing import List

from ..models import OptimizationCandidate
from .evaluator import QualityEvaluator
from .utils import (
    calculate_quality_improvement,
    calculate_quality_improvement_percentage,
    filter_feasible_candidates,
)


class QualityOptimizationResult:
    """Result of quality-focused optimization."""

    def __init__(
        self,
        selected_model: str,
        selected_provider: str,
        selected_quality_score: Decimal,
        baseline_quality_score: Decimal | None,
        quality_improvement: Decimal,
        quality_improvement_percentage: Decimal,
        selected_cost: Decimal,
        selected_latency_ms: Decimal,
        candidates_evaluated: int,
        candidates_feasible: int,
        optimized: bool,
        reason: str,
    ) -> None:
        self.selected_model = selected_model
        self.selected_provider = selected_provider
        self.selected_quality_score = selected_quality_score
        self.baseline_quality_score = baseline_quality_score
        self.quality_improvement = quality_improvement
        self.quality_improvement_percentage = (
            quality_improvement_percentage
        )
        self.selected_cost = selected_cost
        self.selected_latency_ms = selected_latency_ms
        self.candidates_evaluated = candidates_evaluated
        self.candidates_feasible = candidates_feasible
        self.optimized = optimized
        self.reason = reason


class QualityOptimizer:
    """Optimize model/provider selection for maximum quality."""

    def __init__(
        self,
        evaluator: QualityEvaluator | None = None,
    ) -> None:
        self.evaluator = (
            evaluator
            if evaluator is not None
            else QualityEvaluator()
        )

    def optimize(
        self,
        candidates: List[OptimizationCandidate],
        current_model: str | None = None,
        current_provider: str | None = None,
        min_quality_score: Decimal | int | float | str | None = None,
        max_cost: Decimal | int | float | str | None = None,
        max_latency_ms: Decimal | int | float | str | None = None,
    ) -> QualityOptimizationResult:
        """Select the highest-quality feasible candidate."""
        if not candidates:
            raise ValueError(
                "candidates must not be empty"
            )

        feasible = filter_feasible_candidates(
            candidates,
            min_quality_score=min_quality_score,
            max_cost=max_cost,
            max_latency_ms=max_latency_ms,
        )

        if not feasible:
            raise ValueError(
                "No candidates satisfy quality optimization constraints."
            )

        evaluations = self.evaluator.evaluate_all(
            feasible,
            min_quality_score=min_quality_score,
        )

        selected_evaluation = next(
            (
                evaluation
                for evaluation in evaluations
                if evaluation.meets_requirement
            ),
            evaluations[0],
        )

        selected = next(
            candidate
            for candidate in feasible
            if (
                candidate.model
                == selected_evaluation.model
                and candidate.provider
                == selected_evaluation.provider
            )
        )

        baseline = self._find_baseline(
            candidates,
            current_model,
            current_provider,
        )

        baseline_quality = (
            baseline.quality_score
            if baseline is not None
            else None
        )

        if baseline_quality is not None:
            improvement = calculate_quality_improvement(
                baseline_quality,
                selected.quality_score,
            )

            improvement_percentage = (
                calculate_quality_improvement_percentage(
                    baseline_quality,
                    selected.quality_score,
                )
            )
        else:
            improvement = Decimal("0")
            improvement_percentage = Decimal("0")

        optimized = (
            baseline is None
            or (
                selected.model != baseline.model
                or selected.provider != baseline.provider
            )
        )

        if baseline is None:
            reason = (
                "Selected the highest-quality feasible "
                "candidate because no baseline route "
                "was provided."
            )
        elif optimized:
            reason = (
                "Switched to the highest-quality feasible "
                "candidate."
            )
        else:
            reason = (
                "Current route is already the "
                "highest-quality feasible candidate."
            )

        return QualityOptimizationResult(
            selected_model=selected.model,
            selected_provider=selected.provider,
            selected_quality_score=(
                selected.quality_score
            ),
            baseline_quality_score=baseline_quality,
            quality_improvement=improvement,
            quality_improvement_percentage=(
                improvement_percentage
            ),
            selected_cost=selected.estimated_cost,
            selected_latency_ms=(
                selected.estimated_latency_ms
            ),
            candidates_evaluated=len(candidates),
            candidates_feasible=len(feasible),
            optimized=optimized,
            reason=reason,
        )

    @staticmethod
    def _find_baseline(
        candidates: List[OptimizationCandidate],
        current_model: str | None,
        current_provider: str | None,
    ) -> OptimizationCandidate | None:
        """Find the current model/provider candidate."""
        if current_model is None:
            return None

        for candidate in candidates:
            if candidate.model != current_model:
                continue

            if (
                current_provider is not None
                and candidate.provider
                != current_provider
            ):
                continue

            return candidate

        return None


def create_default_quality_optimizer() -> QualityOptimizer:
    """Create the default quality optimizer."""
    return QualityOptimizer()


__all__ = [
    "QualityOptimizationResult",
    "QualityOptimizer",
    "create_default_quality_optimizer",
]
