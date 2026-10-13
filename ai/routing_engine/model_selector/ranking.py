from __future__ import annotations

from ai.routing_engine.constants import RoutingObjective
from ai.routing_engine.models import ModelCandidate
from ai.routing_engine.model_selector.scoring import score_candidate


def rank_candidates(
    candidates: list[ModelCandidate],
    objective: RoutingObjective,
    quality_weight: float = 0.50,
    cost_weight: float = 0.25,
    latency_weight: float = 0.25,
) -> list[tuple[ModelCandidate, float]]:
    scored = [
        (
            candidate,
            score_candidate(
                candidate,
                candidates,
                objective,
                quality_weight=quality_weight,
                cost_weight=cost_weight,
                latency_weight=latency_weight,
            ),
        )
        for candidate in candidates
    ]

    def latency_tiebreak(candidate: ModelCandidate) -> float:
        if candidate.estimated_latency_ms is None:
            return float("-inf")
        return -candidate.estimated_latency_ms

    return sorted(
        scored,
        key=lambda item: (
            item[1],
            item[0].quality,
            -(item[0].input_cost + item[0].output_cost),
            latency_tiebreak(item[0]),
            item[0].model_id,
        ),
        reverse=True,
    )


__all__ = [
    "rank_candidates",
]
