from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ai.providers.base.models import (
    ModelCapability,
    ModelInfo,
    ProviderTier,
)


@dataclass(frozen=True, slots=True)
class XAIModel:
    id: str
    context_window: int = 0
    max_output_tokens: int = 0
    quality_score: float | None = None
    input_cost_per_1m_tokens: float = 0.0
    output_cost_per_1m_tokens: float = 0.0
    aliases: tuple[str, ...] = ()

    def to_model_info(self) -> ModelInfo:
        return ModelInfo(
            id=self.id,
            provider="xai",
            aliases=self.aliases,
            tier=ProviderTier.LLM,
            capabilities=frozenset(
                {
                    ModelCapability.CHAT,
                    ModelCapability.REASONING,
                    ModelCapability.CODE,
                    ModelCapability.STREAMING,
                }
            ),
            context_window=self.context_window,
            max_output_tokens=self.max_output_tokens,
            input_cost_per_1m_tokens=self.input_cost_per_1m_tokens,
            output_cost_per_1m_tokens=self.output_cost_per_1m_tokens,
            quality_score=self.quality_score,
            enabled=True,
            metadata={
                "provider": "xai",
                "family": "grok",
            },
        )


DEFAULT_XAI_MODELS = (
    XAIModel(
        id="grok-4.7",
        context_window=500000,
        quality_score=0.99,
        aliases=("grok", "grok-latest"),
    ),
    XAIModel(
        id="grok-4.6",
        context_window=200000,
        quality_score=0.98,
        aliases=("grok-4",),
    ),
    XAIModel(
        id="grok-4.3",
        context_window=131072,
        quality_score=0.96,
    ),
)


def get_default_models() -> list[ModelInfo]:
    return [model.to_model_info() for model in DEFAULT_XAI_MODELS]


def model_from_remote(data: dict[str, Any]) -> ModelInfo:
    model_id = str(data.get("id") or data.get("name") or "").strip()

    return ModelInfo(
        id=model_id,
        provider="xai",
        tier=ProviderTier.LLM,
        capabilities=frozenset(
            {
                ModelCapability.CHAT,
                ModelCapability.STREAMING,
            }
        ),
        context_window=int(
            data.get("context_length")
            or data.get("context_window")
            or 0
        ),
        enabled=True,
        metadata={
            "remote": True,
            "raw": data,
        },
    )
