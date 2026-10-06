from __future__ import annotations

from decimal import Decimal
from typing import List, Optional

from .constants import (
    DEFAULT_COST_WEIGHT,
    DEFAULT_LATENCY_WEIGHT,
    DEFAULT_QUALITY_WEIGHT,
)
from .exceptions import (
    InvalidOptimizationCandidateError,
    InvalidOptimizationRequestError,
    NoFeasibleCandidateError,
    NoOptimizationCandidateError,
)
from .interfaces import (
    CandidateScorer,
    ConstraintEvaluator,
    OptimizationEngineInterface,
)
from .models import (
    OptimizationAction,
    OptimizationCandidate,
    OptimizationDecision,
    OptimizationObjective,
    OptimizationRequest,
    OptimizationResult,
    OptimizationScore,
)
from .utils import (
    filter_feasible_candidates,
    normalize_costs,
    normalize_latencies,
    normalize_qualities,
    validate_cost,
    validate_latency,
    validate_quality,
    validate_weights,
    weighted_score,
)


class DefaultCandidateScorer(CandidateScorer):
    """Default weighted candidate scoring implementation."""

    def score(
        self,
        request: OptimizationRequest,
        candidate: OptimizationCandidate,
    ) -> OptimizationScore:

        candidates = request.candidates

        cost_scores = normalize_costs(candidates)
        latency_scores = normalize_latencies(candidates)
        quality_scores = normalize_qualities(candidates)

        try:
            index = candidates.index(candidate)
        except ValueError as exc:
            raise InvalidOptimizationCandidateError(
                "Candidate is not part of the request"
            ) from exc

        total_score = weighted_score(
            cost_score=cost_scores[index],
            latency_score=latency_scores[index],
            quality_score=quality_scores[index],
            weights=request.weights,
        )

        return OptimizationScore(
            model=candidate.model,
            provider=candidate.provider,
            cost_score=cost_scores[index],
            latency_score=latency_scores[index],
            quality_score=quality_scores[index],
            total_score=total_score,
        )


class DefaultConstraintEvaluator(ConstraintEvaluator):
    """Default optimization constraint evaluator."""

    def is_feasible(
        self,
        request: OptimizationRequest,
        candidate: OptimizationCandidate,
    ) -> bool:
        return candidate in filter_feasible_candidates(
            [candidate],
            request.constraints,
        )


class OptimizationEngine(OptimizationEngineInterface):
    """Core ModelNow optimization engine."""

    def __init__(
        self,
        scorer: Optional[CandidateScorer] = None,
        constraint_evaluator: Optional[
            ConstraintEvaluator
        ] = None,
    ) -> None:
        self.scorer = (
            scorer
            if scorer is not None
            else DefaultCandidateScorer()
        )

        self.constraint_evaluator = (
            constraint_evaluator
            if constraint_evaluator is not None
            else DefaultConstraintEvaluator()
        )

    def optimize(
        self,
        request: OptimizationRequest,
    ) -> OptimizationResult:

        self._validate_request(request)

        candidates = request.candidates

        if not candidates:
            raise NoOptimizationCandidateError(
                "No optimization candidates available"
            )

        feasible_candidates = [
            candidate
            for candidate in candidates
            if self.constraint_evaluator.is_feasible(
                request,
                candidate,
            )
        ]

        if not feasible_candidates:
            raise NoFeasibleCandidateError(
                "No candidate satisfies optimization constraints"
            )

        scored_candidates = [
            (
                candidate,
                self.scorer.score(
                    request,
                    candidate,
                ),
            )
            for candidate in feasible_candidates
        ]

        selected_candidate, selected_score = max(
            scored_candidates,
            key=lambda item: item[1].total_score,
        )

        baseline = self._find_baseline(request)

        optimized = (
            baseline is None
            or selected_candidate.model != baseline.model
            or selected_candidate.provider != baseline.provider
        )

        action = (
            OptimizationAction.SWITCH_MODEL
            if (
                baseline is not None
                and selected_candidate.model != baseline.model
            )
            else (
                OptimizationAction.SWITCH_PROVIDER
                if (
                    baseline is not None
                    and selected_candidate.provider
                    != baseline.provider
                )
                else OptimizationAction.KEEP
            )
        )

        reason = self._build_reason(
            request=request,
            selected=selected_candidate,
            score=selected_score,
            baseline=baseline,
        )

        decision = OptimizationDecision(
            action=action,
            selected_model=selected_candidate.model,
            selected_provider=selected_candidate.provider,
            score=selected_score,
            reason=reason,
            objective=request.objective,
            request_id=request.request_id,
            optimized=optimized,
            metadata=request.metadata,
        )

        return OptimizationResult(
            decision=decision,
            candidates_evaluated=len(candidates),
            candidates_feasible=len(feasible_candidates),
            baseline_model=(
                baseline.model
                if baseline is not None
                else None
            ),
            baseline_provider=(
                baseline.provider
                if baseline is not None
                else None
            ),
            baseline_cost=(
                baseline.estimated_cost
                if baseline is not None
                else None
            ),
            optimized_cost=selected_candidate.estimated_cost,
            baseline_latency_ms=(
                baseline.estimated_latency_ms
                if baseline is not None
                else None
            ),
            optimized_latency_ms=(
                selected_candidate.estimated_latency_ms
            ),
            baseline_quality=(
                baseline.quality_score
                if baseline is not None
                else None
            ),
            optimized_quality=selected_candidate.quality_score,
            metadata=request.metadata,
        )

    def evaluate(
        self,
        request: OptimizationRequest,
        candidate: OptimizationCandidate,
    ) -> OptimizationScore:
        self._validate_request(request)
        self._validate_candidate(candidate)

        return self.scorer.score(
            request,
            candidate,
        )

    def _validate_request(
        self,
        request: OptimizationRequest,
    ) -> None:
        if not isinstance(
            request,
            OptimizationRequest,
        ):
            raise InvalidOptimizationRequestError(
                "request must be an OptimizationRequest"
            )

        validate_weights(request.weights)

        for candidate in request.candidates:
            self._validate_candidate(candidate)

    @staticmethod
    def _validate_candidate(
        candidate: OptimizationCandidate,
    ) -> None:
        if not candidate.model:
            raise InvalidOptimizationCandidateError(
                "candidate model must not be empty"
            )

        if not candidate.provider:
            raise InvalidOptimizationCandidateError(
                "candidate provider must not be empty"
            )

        try:
            validate_cost(candidate.estimated_cost)
            validate_latency(
                candidate.estimated_latency_ms
            )
            validate_quality(candidate.quality_score)
        except ValueError as exc:
            raise InvalidOptimizationCandidateError(
                str(exc)
            ) from exc

    @staticmethod
    def _find_baseline(
        request: OptimizationRequest,
    ) -> Optional[OptimizationCandidate]:
        if request.model is None:
            return None

        for candidate in request.candidates:
            if candidate.model != request.model:
                continue

            if (
                request.provider is not None
                and candidate.provider != request.provider
            ):
                continue

            return candidate

        return None

    @staticmethod
    def _build_reason(
        request: OptimizationRequest,
        selected: OptimizationCandidate,
        score: OptimizationScore,
        baseline: Optional[OptimizationCandidate],
    ) -> str:

        if baseline is None:
            return (
                "Selected the highest-scoring feasible "
                "candidate using the configured optimization "
                "objective and weights."
            )

        if (
            selected.model == baseline.model
            and selected.provider == baseline.provider
        ):
            return (
                "Kept the current route because it provides "
                "the best feasible optimization score."
            )

        if selected.model != baseline.model:
            return (
                f"Switched from {baseline.model} to "
                f"{selected.model} because the selected route "
                f"provides a better optimization score."
            )

        return (
            f"Switched provider from {baseline.provider} to "
            f"{selected.provider} because the selected route "
            f"provides a better optimization score."
        )


def create_default_optimization_engine() -> OptimizationEngine:
    """Create a default ModelNow Optimization Engine."""

    return OptimizationEngine()


__all__ = [
    "DefaultCandidateScorer",
    "DefaultConstraintEvaluator",
    "OptimizationEngine",
    "create_default_optimization_engine",
]
