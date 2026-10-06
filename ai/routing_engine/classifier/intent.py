from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum


class TaskType(StrEnum):
    GENERAL = "general"
    REASONING = "reasoning"
    CODING = "coding"
    WRITING = "writing"
    SUMMARIZATION = "summarization"
    EXTRACTION = "extraction"
    TRANSLATION = "translation"
    ANALYSIS = "analysis"
    TOOL_USE = "tool_use"
    AGENTIC = "agentic"


class TaskComplexity(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class ReasoningLevel(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


@dataclass(frozen=True)
class TaskProfile:
    task_type: TaskType = TaskType.GENERAL
    complexity: TaskComplexity = TaskComplexity.LOW
    reasoning_level: ReasoningLevel = ReasoningLevel.LOW

    code_required: bool = False
    vision_required: bool = False
    audio_required: bool = False
    tool_use_required: bool = False
    agentic_required: bool = False

    context_size: int = 0
    estimated_input_tokens: int = 0

    latency_sensitive: bool = False
    quality_sensitive: bool = False
    cost_sensitive: bool = False
    streaming_required: bool = False

    preferred_tier: str | None = None
    required_capabilities: tuple[str, ...] = ()

    confidence: float = 1.0

    metadata: dict[str, object] = field(default_factory=dict)


__all__ = [
    "TaskType",
    "TaskComplexity",
    "ReasoningLevel",
    "TaskProfile",
]
