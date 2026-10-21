from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any, List, Optional

from ..models import OptimizationCandidate
from .strategy import (
    OptimizationStrategy,
    StrategyManager,
)
from .utils import (
    calculate_weighted_score,
    normalize_score,
    validate_candidates,
    validate_request,
)


@dataclass(frozen=True)
class OptimizationPipelineRequest:
    """Input to the optimization pipeline."""

    candidates: List[OptimizationCandidate]
    strategy: OptimizationStrategy | str = (
        OptimizationStrategy.BALANCED
    )
    current_model: Optional[str] = None
    current_provider: Optional[str] = None
    request_id: Optional[str] = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class OptimizationPipelineCandidate:
    """Candidate with normalized pipeline scores."""

    model: str
    provider: str
    cost_score: Decimal
    latency_score: Decimal
    quality_score: Decimal
    overall_score: Decimal
    estimated_cost: Decimal
    estimated_latency_ms: Decimal
    changed: bool


@dataclass(frozen=True)
class OptimizationPipelineResult:
    """Final result produced by the optimization pipeline."""

    selected_model: str
    selected_provider: str
    selected_cost: Decimal
    selected_latency_ms: Decimal
    selected_quality_score: Decimal
    score: Decimal
    strategy: OptimizationStrategy
    changed: bool
    candidates_evaluated: int
    candidates_ranked: int
    reason: str
    request_id: Optional[str] = None
    metadata: dict[str, Any] = field(default_factory=dict)


class OptimizationPipeline:
    """Orchestrate multi-objective optimization."""

    def __init__(
        self,
        strategy_manager: StrategyManager | None = None,
    ) -> None:
        self.strategy_manager = (
            strategy_manager
            if strategy_manager is not None
            else StrategyManager()
        )

    def run(
        self,
        request: OptimizationPipelineRequest,
    ) -> OptimizationPipelineResult:
        validate_request(request)

        candidates = validate_candidates(
            request.candidates
        )

        if not candidates:
            raise ValueError(
                "optimization pipeline requires candidates"
            )

        strategy_config = self.strategy_manager.get_config(
            request.strategy
        )

        scored = self._score_candidates(
            candidates,
            strategy_config.weights.as_dict(),
        )

        if not scored:
            raise ValueError(
                "no candidates could be scored"
            )

        ranked = sorted(
            scored,
            key=lambda candidate: (
                candidate.overall_score,
                candidate.quality_score,
                -candidate.estimated_latency_ms,
                -candidate.estimated_cost,
            ),
            reverse=True,
        )

        selected = ranked[0]

        changed = (
            request.current_model != selected.model
            or request.current_provider != selected.provider
        )

        if changed:
            reason = (
                f"selected the highest-scoring feasible "
                f"candidate under {strategy_config.strategy.value} "
                f"strategy"
            )
        else:
            reason = (
                f"current route remains optimal under "
                f"{strategy_config.strategy.value} strategy"
            )

        return OptimizationPipelineResult(
            selected_model=selected.model,
            selected_provider=selected.provider,
            selected_cost=selected.estimated_cost,
            selected_latency_ms=selected.estimated_latency_ms,
            selected_quality_score=selected.quality_score,
            score=selected.overall_score,
            strategy=strategy_config.strategy,
            changed=changed,
            candidates_evaluated=len(candidates),
            candidates_ranked=len(ranked),
            reason=reason,
            request_id=request.request_id,
            metadata={
                **request.metadata,
                "strategy": strategy_config.strategy.value,
                "weights": strategy_config.weights.as_dict(),
                "pipeline_candidate_scores": {
                    "cost_score": str(selected.cost_score),
                    "latency_score": str(selected.latency_score),
                    "quality_score": str(selected.quality_score),
                },
            },
        )

    def rank(
        self,
        request: OptimizationPipelineRequest,
    ) -> List[OptimizationPipelineCandidate]:
        """Return all candidates ranked by the selected strategy."""
        validate_request(request)

        candidates = validate_candidates(
            request.candidates
        )

        if not candidates:
            raise ValueError(
                "optimization pipeline requires candidates"
            )

        strategy_config = self.strategy_manager.get_config(
            request.strategy
        )

        ranked = self._score_candidates(
            candidates,
            strategy_config.weights.as_dict(),
        )

        return sorted(
            ranked,
            key=lambda candidate: (
                candidate.overall_score,
                candidate.quality_score,
                -candidate.estimated_latency_ms,
                -candidate.estimated_cost,
            ),
            reverse=True,
        )

    @staticmethod
    def _score_candidates(
        candidates: List[OptimizationCandidate],
        weights: dict[str, float],
    ) -> List[OptimizationPipelineCandidate]:
        costs = [
            candidate.estimated_cost
            for candidate in candidates
        ]

        latencies = [
            candidate.estimated_latency_ms
            for candidate in candidates
        ]

        qualities = [
            candidate.quality_score
            for candidate in candidates
        ]

        min_cost = min(costs)
        max_cost = max(costs)

        min_latency = min(latencies)
        max_latency = max(latencies)

        min_quality = min(qualities)
        max_quality = max(qualities)

        scored: List[OptimizationPipelineCandidate] = []

        for candidate in candidates:
            cost_score = OptimizationPipeline._inverse_normalize(
                candidate.estimated_cost,
                min_cost,
                max_cost,
            )

            latency_score = OptimizationPipeline._inverse_normalize(
                candidate.estimated_latency_ms,
                min_latency,
                max_latency,
            )

            quality_score = OptimizationPipeline._normalize(
                candidate.quality_score,
                min_quality,
                max_quality,
            )

            overall_score = calculate_weighted_score(
                {
                    "cost": cost_score,
                    "latency": latency_score,
                    "quality": quality_score,
                },
                weights,
            )

            scored.append(
                OptimizationPipelineCandidate(
                    model=candidate.model,
                    provider=candidate.provider,
                    cost_score=cost_score,
                    latency_score=latency_score,
                    quality_score=quality_score,
                    overall_score=overall_score,
                    estimated_cost=candidate.estimated_cost,
                    estimated_latency_ms=(
                        candidate.estimated_latency_ms
                    ),
                    changed=False,
                )
            )

        return scored

    @staticmethod
    def _normalize(
        value: Decimal,
        minimum: Decimal,
        maximum: Decimal,
    ) -> Decimal:
        if maximum <= minimum:
            return Decimal("1")

        result = (
            value - minimum
        ) / (
            maximum - minimum
        )

        return normalize_score(result)

    @staticmethod
    def _inverse_normalize(
        value: Decimal,
        minimum: Decimal,
        maximum: Decimal,
    ) -> Decimal:
        return Decimal("1") - OptimizationPipeline._normalize(
            value,
            minimum,
            maximum,
        )


def create_default_pipeline() -> OptimizationPipeline:
    """Create the default optimization pipeline."""
    return OptimizationPipeline()


__all__ = [
    "OptimizationPipelineRequest",
    "OptimizationPipelineCandidate",
    "OptimizationPipelineResult",
    "OptimizationPipeline",
    "create_default_pipeline",
]


