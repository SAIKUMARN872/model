from __future__ import annotations

from ai.routing_engine.constants import RoutingObjective
from ai.routing_engine.models import ModelCandidate
from ai.routing_engine.model_selector.scoring import score_candidate


def rank_candidates(
    candidates: list[ModelCandidate],
    objective: RoutingObjective,
) -> list[tuple[ModelCandidate, float]]:
    scored = [
        (
            candidate,
            score_candidate(
                candidate,
                candidates,
                objective,
            ),
        )
        for candidate in candidates
    ]

    return sorted(
        scored,
        key=lambda item: (
            item[1],
            item[0].quality,
            -(item[0].input_cost + item[0].output_cost),
            -item[0].estimated_latency_ms,
            item[0].model_id,
        ),
        reverse=True,
    )


__all__ = [
    "rank_candidates",
]
