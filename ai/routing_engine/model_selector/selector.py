from __future__ import annotations

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

    async def select(
        self,
        request: RoutingRequest,
        candidates: list[ModelCandidate],
    ) -> RoutingDecision:
        if not candidates:
            raise NoRouteAvailableError(
                "No routing candidates are available."
            )

        ranked = rank_candidates(
            candidates,
            request.objective,
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
                "candidate_scores": {
                    candidate.model_id: score
                    for candidate, score in ranked
                },
            },
        )


__all__ = [
    "DefaultModelSelector",
]
