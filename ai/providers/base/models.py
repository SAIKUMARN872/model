from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any


class ModelCapability(StrEnum):
    """Capabilities that a ModelNow model can provide."""

    CHAT = "chat"
    REASONING = "reasoning"
    CODE = "code"
    VISION = "vision"
    AUDIO = "audio"
    IMAGE_GENERATION = "image_generation"
    TOOL_USE = "tool_use"
    STRUCTURED_OUTPUT = "structured_output"
    JSON = "json"
    STREAMING = "streaming"
    LONG_CONTEXT = "long_context"
    RAG = "rag"
    AGENTIC = "agentic"


class ProviderStatus(StrEnum):
    """Normalized runtime state of an AI provider."""

    UNKNOWN = "unknown"
    INITIALIZING = "initializing"
    READY = "ready"
    DEGRADED = "degraded"
    UNAVAILABLE = "unavailable"
    DISABLED = "disabled"
    CLOSED = "closed"


class ProviderTier(StrEnum):
    """
    Model/provider economic tier used by ModelNow routing.

    SLM = Small Language Model
    MLM = Medium Language Model
    LLM = Large Language Model
    """

    SLM = "slm"
    MLM = "mlm"
    LLM = "llm"


@dataclass(frozen=True)
class ModelInfo:
    """
    Normalized metadata describing a model exposed by a provider.
    """

    id: str
    provider: str

    aliases: tuple[str, ...] = ()

    tier: ProviderTier = ProviderTier.LLM

    capabilities: frozenset[ModelCapability] = frozenset(
        {ModelCapability.CHAT}
    )

    context_window: int = 0
    max_output_tokens: int = 0

    input_cost_per_1m_tokens: float = 0.0
    output_cost_per_1m_tokens: float = 0.0

    estimated_latency_ms: float | None = None
    quality_score: float | None = None

    enabled: bool = True

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def supports(
        self,
        capability: ModelCapability,
    ) -> bool:
        return capability in self.capabilities

    def matches(
        self,
        model_id: str,
    ) -> bool:
        normalized = model_id.strip().lower()

        if normalized == self.id.lower():
            return True

        return normalized in {
            alias.lower()
            for alias in self.aliases
        }


@dataclass(frozen=True)
class ProviderHealth:
    """
    Normalized health result for a ModelNow provider.
    """

    healthy: bool
    provider: str

    status: ProviderStatus = ProviderStatus.UNKNOWN

    latency_ms: float | None = None

    message: str | None = None

    checked_at: float | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


@dataclass(frozen=True)
class ProviderMetadata:
    """
    Describes provider capabilities and enterprise readiness.
    """

    provider_id: str
    display_name: str

    version: str = "1.0"

    tier_support: frozenset[ProviderTier] = frozenset(
        {ProviderTier.LLM}
    )

    capabilities: frozenset[ModelCapability] = frozenset(
        {ModelCapability.CHAT}
    )

    enterprise_ready: bool = False

    streaming_supported: bool = False
    tool_use_supported: bool = False

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


