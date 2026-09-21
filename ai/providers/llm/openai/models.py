from __future__ import annotations

from dataclasses import dataclass, field

from ...base.models import ModelCapability
from ...constants import ProviderTier


@dataclass(frozen=True)
class OpenAIModel:
    model_id: str
    display_name: str
    tier: ProviderTier = ProviderTier.LLM
    context_window: int = 128000
    max_output_tokens: int = 16384
    input_cost_per_1k_tokens: float = 0.0
    output_cost_per_1k_tokens: float = 0.0
    latency_ms: float = 0.0
    quality_score: float = 0.0
    capabilities: frozenset[ModelCapability] = field(
        default_factory=frozenset
    )
    aliases: tuple[str, ...] = ()
    enabled: bool = True

    @property
    def model_info(self) -> dict:
        return {
            "model_id": self.model_id,
            "display_name": self.display_name,
            "tier": self.tier.value,
            "context_window": self.context_window,
            "max_output_tokens": self.max_output_tokens,
            "input_cost_per_1k_tokens": self.input_cost_per_1k_tokens,
            "output_cost_per_1k_tokens": self.output_cost_per_1k_tokens,
            "latency_ms": self.latency_ms,
            "quality_score": self.quality_score,
            "capabilities": [
                capability.value for capability in self.capabilities
            ],
            "aliases": list(self.aliases),
            "enabled": self.enabled,
        }


_COMMON_CAPABILITIES = frozenset(
    {
        ModelCapability.CHAT,
        ModelCapability.REASONING,
        ModelCapability.CODE,
        ModelCapability.STREAMING,
        ModelCapability.TOOL_USE,
        ModelCapability.STRUCTURED_OUTPUT,
        ModelCapability.JSON,
        ModelCapability.LONG_CONTEXT,
    }
)


DEFAULT_OPENAI_MODELS = (
    OpenAIModel(
        model_id="gpt-5",
        display_name="GPT-5",
        tier=ProviderTier.LLM,
        context_window=400000,
        max_output_tokens=128000,
        quality_score=0.98,
        capabilities=_COMMON_CAPABILITIES,
    ),
    OpenAIModel(
        model_id="gpt-5-mini",
        display_name="GPT-5 Mini",
        tier=ProviderTier.MLM,
        context_window=400000,
        max_output_tokens=128000,
        quality_score=0.93,
        capabilities=_COMMON_CAPABILITIES,
    ),
    OpenAIModel(
        model_id="gpt-4.1",
        display_name="GPT-4.1",
        tier=ProviderTier.LLM,
        context_window=1047576,
        max_output_tokens=32768,
        quality_score=0.95,
        capabilities=_COMMON_CAPABILITIES,
    ),
)


__all__ = [
    "OpenAIModel",
    "DEFAULT_OPENAI_MODELS",
]


