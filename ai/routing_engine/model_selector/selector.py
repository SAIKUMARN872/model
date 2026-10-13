from __future__ import annotations

from ai.routing_engine.adaptive_router import AdaptiveRoutingEngine
from ai.routing_engine.adaptive_router.scoring import combine_adaptive_score
from ai.routing_engine.constants import RoutingStatus
from ai.routing_engine.exceptions import NoRouteAvailableError
from ai.routing_engine.interfaces import ModelSelector
from ai.routing_engine.models import (
    ModelCandidate,
    RoutingDecision,
    RoutingRequest,
)
from ai.routing_engine.model_selector.ranking import rank_candidates


class DefaultModelSelector(ModelSelector):
    """Select the highest-scoring routing candidate."""

    def __init__(
        self,
        adaptive_router: AdaptiveRoutingEngine | None = None,
    ) -> None:
        self.adaptive_router = adaptive_router

    async def select(
        self,
        request: RoutingRequest,
        candidates: list[ModelCandidate],
    ) -> RoutingDecision:
        if not candidates:
            raise NoRouteAvailableError(
                "No routing candidates are available."
            )

        quality_weight = float(
            request.metadata.get("policy_quality_weight", 0.50)
        )
        cost_weight = float(
            request.metadata.get("policy_cost_weight", 0.25)
        )
        latency_weight = float(
            request.metadata.get("policy_latency_weight", 0.25)
        )

        ranked = rank_candidates(
            candidates,
            request.objective,
            quality_weight=quality_weight,
            cost_weight=cost_weight,
            latency_weight=latency_weight,
        )

        adaptive_scores = {}
        adaptive_applied = False

        if self.adaptive_router is not None:
            task_type = request.metadata.get("task_type")

            signals = self.adaptive_router.signals(
                candidates,
                task_type=task_type,
            )

            adaptive_ranked = []

            for candidate, base_score in ranked:
                signal = signals.get(candidate.model_id)

                adaptive_result = combine_adaptive_score(
                    candidate,
                    base_score,
                    signal,
                    candidates,
                    quality_weight=quality_weight,
                    cost_weight=cost_weight,
                    latency_weight=latency_weight,
                    signals=signals,
                )

                adaptive_ranked.append(
                    (candidate, adaptive_result.score)
                )

                adaptive_scores[candidate.model_id] = {
                    "base_score": adaptive_result.base_score,
                    "adaptive_score": adaptive_result.adaptive_score,
                    "final_score": adaptive_result.score,
                    "adaptive_applied": (
                        adaptive_result.metadata["adaptive_applied"]
                    ),
                    "confidence": adaptive_result.metadata["confidence"],
                }

                if adaptive_result.metadata["adaptive_applied"]:
                    adaptive_applied = True

            ranked = sorted(
                adaptive_ranked,
                key=lambda item: (
                    item[1],
                    item[0].quality,
                    -(item[0].input_cost + item[0].output_cost),
                    item[0].model_id,
                ),
                reverse=True,
            )

        selected, selected_score = ranked[0]

        return RoutingDecision(
            status=RoutingStatus.SELECTED,
            model_id=selected.model_id,
            provider=selected.provider,
            tier=selected.tier,
            score=selected_score,
            reason=(
                f"Selected using "
                f"{request.objective.value} routing objective."
            ),
            candidates_considered=len(candidates),
            metadata={
                "objective": request.objective.value,
                "quality_weight": quality_weight,
                "cost_weight": cost_weight,
                "latency_weight": latency_weight,
                "adaptive_enabled": self.adaptive_router is not None,
                "adaptive_applied": adaptive_applied,
                "candidate_scores": {
                    candidate.model_id: score
                    for candidate, score in ranked
                },
                "adaptive_scores": adaptive_scores,
            },
        )


__all__ = [
    "DefaultModelSelector",
]
