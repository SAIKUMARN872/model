from __future__ import annotations

from dataclasses import replace
from decimal import Decimal
from typing import Optional

from ..models import (
    OptimizationAction,
    OptimizationCandidate,
    OptimizationDecision,
    OptimizationObjective,
    OptimizationRequest,
    OptimizationResult,
    OptimizationScore,
)
from ..utils import filter_feasible_candidates
from .pipeline import (
    OptimizationPipeline,
    OptimizationPipelineRequest,
)
from .strategy import (
    OptimizationStrategy,
    StrategyManager,
)


class Optimizer:
    """High-level optimization facade for ModelNow."""

    def __init__(
        self,
        pipeline: Optional[OptimizationPipeline] = None,
        strategy_manager: Optional[StrategyManager] = None,
    ) -> None:
        self.strategy_manager = (
            strategy_manager
            if strategy_manager is not None
            else StrategyManager()
        )

        self.pipeline = (
            pipeline
            if pipeline is not None
            else OptimizationPipeline(
                strategy_manager=self.strategy_manager,
            )
        )

    def optimize(
        self,
        request: OptimizationRequest,
    ) -> OptimizationResult:
        """Optimize a request using the configured pipeline."""
        self._validate_request(request)

        if not request.candidates:
            raise ValueError(
                "optimization request requires candidates"
            )

        feasible = filter_feasible_candidates(
            request.candidates,
            request.constraints,
        )

        if not feasible:
            raise ValueError(
                "no candidates satisfy optimization constraints"
            )

        strategy = self._strategy_from_objective(
            request.objective
        )

        self.strategy_manager.set_weights(
            strategy,
            {
                "cost": float(request.weights.cost),
                "latency": float(request.weights.latency),
                "quality": float(request.weights.quality),
            },
        )

        pipeline_request = OptimizationPipelineRequest(
            candidates=list(feasible),
            strategy=strategy,
            current_model=request.model,
            current_provider=request.provider,
            request_id=request.request_id,
            metadata=dict(request.metadata),
        )

        pipeline_result = self.pipeline.run(
            pipeline_request
        )

        selected = self._find_candidate(
            feasible,
            pipeline_result.selected_model,
            pipeline_result.selected_provider,
        )

        baseline = self._find_baseline(request)

        action = self._determine_action(
            baseline,
            selected,
        )

        optimized = (
            baseline is None
            or (
                baseline.model != selected.model
                or baseline.provider != selected.provider
            )
        )

        score = OptimizationScore(
            model=selected.model,
            provider=selected.provider,
            cost_score=self._candidate_score(
                pipeline_result,
                "cost_score",
            ),
            latency_score=self._candidate_score(
                pipeline_result,
                "latency_score",
            ),
            quality_score=self._candidate_score(
                pipeline_result,
                "quality_score",
            ),
            total_score=pipeline_result.score,
        )

        decision = OptimizationDecision(
            action=action,
            selected_model=selected.model,
            selected_provider=selected.provider,
            score=score,
            reason=pipeline_result.reason,
            objective=request.objective,
            request_id=request.request_id,
            optimized=optimized,
            metadata=dict(request.metadata),
        )

        return OptimizationResult(
            decision=decision,
            candidates_evaluated=len(request.candidates),
            candidates_feasible=len(feasible),
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
            optimized_cost=selected.estimated_cost,
            baseline_latency_ms=(
                baseline.estimated_latency_ms
                if baseline is not None
                else None
            ),
            optimized_latency_ms=(
                selected.estimated_latency_ms
            ),
            baseline_quality=(
                baseline.quality_score
                if baseline is not None
                else None
            ),
            optimized_quality=selected.quality_score,
            metadata={
                **request.metadata,
                "pipeline_strategy": strategy.value,
                "pipeline_score": str(
                    pipeline_result.score
                ),
            },
        )

    def rank(
        self,
        request: OptimizationRequest,
    ):
        """Return candidates ranked by the configured strategy."""
        self._validate_request(request)

        feasible = filter_feasible_candidates(
            request.candidates,
            request.constraints,
        )

        if not feasible:
            raise ValueError(
                "no candidates satisfy optimization constraints"
            )

        strategy = self._strategy_from_objective(
            request.objective
        )

        self.strategy_manager.set_weights(
            strategy,
            {
                "cost": float(request.weights.cost),
                "latency": float(request.weights.latency),
                "quality": float(request.weights.quality),
            },
        )

        return self.pipeline.rank(
            OptimizationPipelineRequest(
                candidates=list(feasible),
                strategy=strategy,
                current_model=request.model,
                current_provider=request.provider,
                request_id=request.request_id,
                metadata=dict(request.metadata),
            )
        )

    @staticmethod
    def _validate_request(
        request: OptimizationRequest,
    ) -> None:
        if not isinstance(
            request,
            OptimizationRequest,
        ):
            raise TypeError(
                "request must be an OptimizationRequest"
            )

    @staticmethod
    def _strategy_from_objective(
        objective: OptimizationObjective,
    ) -> OptimizationStrategy:
        mapping = {
            OptimizationObjective.COST: (
                OptimizationStrategy.COST
            ),
            OptimizationObjective.LATENCY: (
                OptimizationStrategy.LATENCY
            ),
            OptimizationObjective.QUALITY: (
                OptimizationStrategy.QUALITY
            ),
            OptimizationObjective.BALANCED: (
                OptimizationStrategy.BALANCED
            ),
        }

        try:
            return mapping[objective]
        except KeyError as exc:
            raise ValueError(
                f"unsupported optimization objective: {objective}"
            ) from exc

    @staticmethod
    def _find_candidate(
        candidates: list[OptimizationCandidate],
        model: str,
        provider: str,
    ) -> OptimizationCandidate:
        for candidate in candidates:
            if (
                candidate.model == model
                and candidate.provider == provider
            ):
                return candidate

        raise ValueError(
            "selected pipeline candidate was not found"
        )

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
    def _determine_action(
        baseline: Optional[OptimizationCandidate],
        selected: OptimizationCandidate,
    ) -> OptimizationAction:
        if baseline is None:
            return OptimizationAction.CHANGE_ROUTE

        if selected.model != baseline.model:
            return OptimizationAction.SWITCH_MODEL

        if selected.provider != baseline.provider:
            return OptimizationAction.SWITCH_PROVIDER

        return OptimizationAction.KEEP

    @staticmethod
    def _candidate_score(
        pipeline_result,
        field_name: str,
    ) -> Decimal:
        ranked = pipeline_result.metadata.get(
            "pipeline_candidate_scores"
        )

        if isinstance(ranked, dict):
            value = ranked.get(field_name)

            if value is not None:
                return Decimal(str(value))

        return Decimal("0")


def create_default_optimizer() -> Optimizer:
    """Create the default high-level optimizer."""
    return Optimizer()


__all__ = [
    "Optimizer",
    "create_default_optimizer",
]
