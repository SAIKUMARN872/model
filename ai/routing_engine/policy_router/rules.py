from __future__ import annotations

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

    return tuple(sorted(capabilities))


def cost_rule(profile: TaskProfile) -> float | None:
    if profile.cost_sensitive:
        return 0.01

    return None


def latency_rule(profile: TaskProfile) -> float | None:
    if profile.latency_sensitive:
        return 1000.0

    return None


__all__ = [
    "tier_rule",
    "quality_rule",
    "capability_rule",
    "cost_rule",
    "latency_rule",
]
