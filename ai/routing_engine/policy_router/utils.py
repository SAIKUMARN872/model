from __future__ import annotations

from .policies import PolicyDecision


def is_allowed(decision: PolicyDecision) -> bool:
    return decision.allowed


def merge_capabilities(
    *capability_sets: tuple[str, ...],
) -> tuple[str, ...]:
    merged: set[str] = set()

    for capabilities in capability_sets:
        merged.update(capabilities)

    return tuple(sorted(merged))


def describe(decision: PolicyDecision) -> str:
    parts: list[str] = []

    if decision.preferred_tier:
        parts.append(
            f"tier={decision.preferred_tier}"
        )

    if decision.min_quality is not None:
        parts.append(
            f"min_quality={decision.min_quality}"
        )

    if decision.max_cost is not None:
        parts.append(
            f"max_cost={decision.max_cost}"
        )

    if decision.max_latency_ms is not None:
        parts.append(
            f"max_latency_ms={decision.max_latency_ms}"
        )

    if decision.required_capabilities:
        parts.append(
            "capabilities="
            + ",".join(decision.required_capabilities)
        )

    if decision.streaming_required:
        parts.append("streaming=true")

    return " | ".join(parts)


__all__ = [
    "is_allowed",
    "merge_capabilities",
    "describe",
]
