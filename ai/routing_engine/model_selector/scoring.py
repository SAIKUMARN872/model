from __future__ import annotations

from ai.routing_engine.constants import RoutingObjective
from ai.routing_engine.models import ModelCandidate


def normalized_quality(candidate: ModelCandidate) -> float:
    return max(0.0, min(1.0, candidate.quality))


def normalized_cost(
    candidate: ModelCandidate,
    candidates: list[ModelCandidate],
) -> float:
    costs = [
        item.input_cost + item.output_cost
        for item in candidates
    ]

    maximum = max(costs, default=0.0)

    if maximum <= 0.0:
        return 1.0

    cost = candidate.input_cost + candidate.output_cost

    return max(
        0.0,
        min(
            1.0,
            1.0 - (cost / maximum),
        ),
    )


def normalized_latency(
    candidate: ModelCandidate,
    candidates: list[ModelCandidate],
) -> float:
    known_latencies = [
        item.estimated_latency_ms
        for item in candidates
        if item.estimated_latency_ms is not None
        and item.estimated_latency_ms > 0.0
    ]

    if not known_latencies:
        return 0.0

    if candidate.estimated_latency_ms is None:
        return 0.0

    if candidate.estimated_latency_ms <= 0.0:
        return 0.0

    minimum = min(known_latencies)
    maximum = max(known_latencies)

    if maximum == minimum:
        return 1.0

    return max(
        0.0,
        min(
            1.0,
            1.0 - (
                (candidate.estimated_latency_ms - minimum)
                / (maximum - minimum)
            ),
        ),
    )


def score_candidate(
    candidate: ModelCandidate,
    candidates: list[ModelCandidate],
    objective: RoutingObjective,
    quality_weight: float = 0.50,
    cost_weight: float = 0.25,
    latency_weight: float = 0.25,
) -> float:
    quality = normalized_quality(candidate)
    cost = normalized_cost(candidate, candidates)
    latency = normalized_latency(candidate, candidates)

    if objective == RoutingObjective.QUALITY:
        return quality

    if objective == RoutingObjective.COST:
        return cost

    if objective == RoutingObjective.LATENCY:
        return latency

    return (
        (quality * quality_weight)
        + (cost * cost_weight)
        + (latency * latency_weight)
    )


__all__ = [
    "normalized_quality",
    "normalized_cost",
    "normalized_latency",
    "score_candidate",
]
