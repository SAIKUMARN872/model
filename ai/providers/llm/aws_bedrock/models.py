@'
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ai.providers.base.models import ProviderTier, ModelCapability


@dataclass(frozen=True)
class BedrockModel:
    """Model metadata for AWS Bedrock models."""

    model_id: str
    display_name: str
    provider_family: str

    tier: ProviderTier = ProviderTier.LLM

    context_window: int = 128000
    max_output_tokens: int = 4096

    input_cost_per_1k_tokens: float = 0.0
    output_cost_per_1k_tokens: float = 0.0

    latency_ms: float = 0.0
    quality_score: float = 0.0

    capabilities: frozenset[ModelCapability] = field(
        default_factory=frozenset
    )

    enabled: bool = True

    @property
    def model_info(self) -> dict[str, Any]:
        return {
            "model_id": self.model_id,
            "display_name": self.display_name,
            "provider_family": self.provider_family,
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
            "enabled": self.enabled,
        }


_COMMON_CAPABILITIES = frozenset(
    {
        ModelCapability.CHAT,
        ModelCapability.STREAMING,
        ModelCapability.TOOL_USE,
        ModelCapability.STRUCTURED_OUTPUT,
    }
)


DEFAULT_BEDROCK_MODELS: tuple[BedrockModel, ...] = (
    BedrockModel(
        model_id="amazon.nova-pro-v1:0",
        display_name="Amazon Nova Pro",
        provider_family="amazon",
        tier=ProviderTier.LLM,
        context_window=300000,
        max_output_tokens=5000,
        quality_score=0.94,
        capabilities=_COMMON_CAPABILITIES,
    ),
    BedrockModel(
        model_id="amazon.nova-lite-v1:0",
        display_name="Amazon Nova Lite",
        provider_family="amazon",
        tier=ProviderTier.MLM,
        context_window=300000,
        max_output_tokens=5000,
        quality_score=0.86,
        capabilities=_COMMON_CAPABILITIES,
    ),
    BedrockModel(
        model_id="meta.llama3-3-70b-instruct-v1:0",
        display_name="Llama 3.3 70B Instruct",
        provider_family="meta",
        tier=ProviderTier.LLM,
        context_window=131072,
        max_output_tokens=2048,
        quality_score=0.91,
        capabilities=_COMMON_CAPABILITIES,
    ),
    BedrockModel(
        model_id="mistral.mistral-large-2407-v1:0",
        display_name="Mistral Large",
        provider_family="mistral",
        tier=ProviderTier.LLM,
        context_window=128000,
        max_output_tokens=8192,
        quality_score=0.91,
        capabilities=_COMMON_CAPABILITIES,
    ),
)


__all__ = [
    "BedrockModel",
    "DEFAULT_BEDROCK_MODELS",
]
'@ | Set-Content ".\ai\providers\llm\aws_bedrock\models.py"