from __future__ import annotations

from ai.routing_engine.constants import RoutingObjective
from ai.routing_engine.classifier.intent import (
    ReasoningLevel,
    TaskComplexity,
    TaskProfile,
)


def tier_rule(profile: TaskProfile) -> str | None:
    if profile.preferred_tier:
        return profile.preferred_tier

    if profile.agentic_required:
        return "llm"

    if profile.reasoning_level == ReasoningLevel.HIGH:
        return "llm"

    if profile.complexity == TaskComplexity.HIGH:
        return "llm"

    if profile.complexity == TaskComplexity.MEDIUM:
        return "mlm"

    return "slm"


def quality_rule(profile: TaskProfile) -> float | None:
    if profile.quality_sensitive:
        if profile.reasoning_level == ReasoningLevel.HIGH:
            return 0.90

        if profile.complexity == TaskComplexity.HIGH:
            return 0.88

        return 0.82

    return None


def capability_rule(profile: TaskProfile) -> tuple[str, ...]:
    capabilities = set(profile.required_capabilities)

    if profile.code_required:
        capabilities.add("code")

    if profile.vision_required:
        capabilities.add("vision")

    if profile.audio_required:
        capabilities.add("audio")

    if profile.tool_use_required:
        capabilities.add("tool_use")

    if profile.agentic_required:
        capabilities.add("agentic")

    if profile.streaming_required:
        capabilities.add("streaming")

    metadata = profile.metadata

    debugging_detected = bool(
        metadata.get("debugging_detected", False)
    )

    distributed_system_detected = bool(
        metadata.get("distributed_system_detected", False)
    )

    architecture_detected = bool(
        metadata.get("architecture_detected", False)
    )

    if profile.reasoning_level in (
        ReasoningLevel.MEDIUM,
        ReasoningLevel.HIGH,
    ):
        capabilities.add("reasoning")

    if debugging_detected and distributed_system_detected:
        capabilities.add("reasoning")
        capabilities.add("long_context")

    if architecture_detected:
        capabilities.add("reasoning")
        capabilities.add("long_context")

    if profile.agentic_required:
        capabilities.add("agentic")
        capabilities.add("reasoning")
        capabilities.add("long_context")

    return tuple(sorted(capabilities))


def cost_rule(profile: TaskProfile) -> float | None:
    if profile.cost_sensitive:
        return 0.01

    return None


def latency_rule(profile: TaskProfile) -> float | None:
    if profile.latency_sensitive:
        return 1000.0

    return None


def routing_weights(
    profile: TaskProfile,
    objective: RoutingObjective,
) -> tuple[float, float, float]:
    """Calculate dynamic quality, cost, and latency weights."""

    if objective == RoutingObjective.QUALITY:
        return 1.0, 0.0, 0.0

    if objective == RoutingObjective.COST:
        return 0.0, 1.0, 0.0

    if objective == RoutingObjective.LATENCY:
        return 0.0, 0.0, 1.0

    quality = 0.50
    cost = 0.25
    latency = 0.25

    if profile.cost_sensitive:
        cost += 0.20
        quality -= 0.10
        latency -= 0.10

    if profile.latency_sensitive:
        latency += 0.20
        quality -= 0.10
        cost -= 0.10

    if profile.quality_sensitive:
        quality += 0.20
        cost -= 0.10
        latency -= 0.10

    if profile.complexity == TaskComplexity.HIGH:
        quality += 0.10
        cost -= 0.05
        latency -= 0.05

    if profile.reasoning_level == ReasoningLevel.HIGH:
        quality += 0.10
        cost -= 0.05
        latency -= 0.05

    if profile.agentic_required:
        quality += 0.15
        cost -= 0.075
        latency -= 0.075

    weights = [
        max(0.0, quality),
        max(0.0, cost),
        max(0.0, latency),
    ]

    total = sum(weights)

    if total <= 0.0:
        return 0.50, 0.25, 0.25

    return tuple(weight / total for weight in weights)


__all__ = [
    "tier_rule",
    "quality_rule",
    "capability_rule",
    "cost_rule",
    "latency_rule",
    "routing_weights",
]
