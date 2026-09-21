from __future__ import annotations

from dataclasses import dataclass

from .models import ModelTier


@dataclass(frozen=True)
class ModelRegistration:
    """
    Registration payload used before a model becomes part of
    the canonical ModelNow registry.
    """

    provider: str
    model_id: str
    display_name: str

    tier: ModelTier = ModelTier.MLM

    enabled: bool = True
    available: bool = True


@dataclass(frozen=True)
class ModelQuery:
    """
    Query/filter parameters used by catalog and routing components.
    """

    provider: str | None = None
    tier: ModelTier | None = None

    enabled_only: bool = False
    available_only: bool = False

    requires_chat: bool = False
    requires_reasoning: bool = False
    requires_code: bool = False
    requires_vision: bool = False
    requires_audio: bool = False
    requires_tool_use: bool = False
    requires_structured_output: bool = False
    requires_streaming: bool = False
    requires_long_context: bool = False
    requires_agentic: bool = False

    min_context_window: int | None = None
    max_input_cost_per_1m: float | None = None
    max_output_cost_per_1m: float | None = None
    max_latency_ms: float | None = None
    min_quality_score: float | None = None


@dataclass(frozen=True)
class ModelRegistrationResult:
    """
    Result returned by registry registration operations.
    """

    provider: str
    model_id: str
    qualified_id: str
    created: bool


__all__ = [
    "ModelRegistration",
    "ModelQuery",
    "ModelRegistrationResult",
]
