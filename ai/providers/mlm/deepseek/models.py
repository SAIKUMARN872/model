from __future__ import annotations

from dataclasses import dataclass, field

from ...base.models import ModelCapability, ProviderTier


@dataclass(frozen=True)
class DeepSeekModel:
    model_id: str
    display_name: str
    tier: ProviderTier = ProviderTier.MLM
    context_window: int = 0
    max_output_tokens: int = 0
    input_cost_per_1k_tokens: float = 0.0
    output_cost_per_1k_tokens: float = 0.0
    latency_ms: float | None = None
    quality_score: float | None = None
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
                capability.value
                for capability in self.capabilities
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
    }
)


DEFAULT_DEEPSEEK_MODELS = (
    DeepSeekModel(
        model_id="deepseek-v4-flash",
        display_name="DeepSeek V4 Flash",
        tier=ProviderTier.MLM,
        capabilities=_COMMON_CAPABILITIES,
    ),
    DeepSeekModel(
        model_id="deepseek-v4-pro",
        display_name="DeepSeek V4 Pro",
        tier=ProviderTier.MLM,
        capabilities=_COMMON_CAPABILITIES,
    ),
)


__all__ = ["DeepSeekModel", "DEFAULT_DEEPSEEK_MODELS"]
