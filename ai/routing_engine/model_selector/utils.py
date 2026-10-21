from __future__ import annotations

from ai.routing_engine.models import ModelCandidate


def total_cost(candidate: ModelCandidate) -> float:
    return candidate.input_cost + candidate.output_cost


def has_capability(
    candidate: ModelCandidate,
    capability: str,
) -> bool:
    value = capability.strip().lower()

    return value in {
        item.strip().lower()
        for item in candidate.capabilities
    }


__all__ = [
    "total_cost",
    "has_capability",
]
