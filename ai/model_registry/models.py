from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class ModelTier(str, Enum):
    SLM = "slm"
    MLM = "mlm"
    LLM = "llm"


@dataclass(frozen=True)
class ModelPricing:
    input_per_1m_tokens: float = 0.0
    output_per_1m_tokens: float = 0.0
    currency: str = "USD"


@dataclass(frozen=True)
class ModelCapabilities:
    chat: bool = True
    reasoning: bool = False
    code: bool = False
    vision: bool = False
    audio: bool = False
    tool_use: bool = False
    structured_output: bool = False
    streaming: bool = True
    long_context: bool = False
    agentic: bool = False


@dataclass(frozen=True)
class ModelRecord:
    """
    Canonical ModelNow representation of a provider model.

    Provider adapters remain responsible for communicating with
    the external provider. ModelRecord contains normalized metadata
    used by discovery, routing, pricing, health, and optimization.
    """

    provider: str
    model_id: str
    display_name: str

    tier: ModelTier = ModelTier.MLM

    context_window: int = 0
    max_output_tokens: int = 0

    pricing: ModelPricing = field(
        default_factory=ModelPricing
    )

    capabilities: ModelCapabilities = field(
        default_factory=ModelCapabilities
    )

    latency_ms: float | None = None
    quality_score: float | None = None

    aliases: tuple[str, ...] = ()

    enabled: bool = True
    available: bool = True

    version: str | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    @property
    def qualified_id(self) -> str:
        return f"{self.provider}:{self.model_id}"

    def matches(self, model_name: str) -> bool:
        value = model_name.strip().lower()

        candidates = {
            self.model_id.lower(),
            self.display_name.lower(),
            *(alias.lower() for alias in self.aliases),
        }

        return value in candidates


__all__ = [
    "ModelTier",
    "ModelPricing",
    "ModelCapabilities",
    "ModelRecord",
]
