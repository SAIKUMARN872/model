from __future__ import annotations

from enum import Enum


class ModelFeature(str, Enum):
    CHAT = "chat"
    REASONING = "reasoning"
    CODE = "code"
    VISION = "vision"
    AUDIO = "audio"
    TOOL_USE = "tool_use"
    STRUCTURED_OUTPUT = "structured_output"
    STREAMING = "streaming"
    LONG_CONTEXT = "long_context"
    AGENTIC = "agentic"


__all__ = ["ModelFeature"]
