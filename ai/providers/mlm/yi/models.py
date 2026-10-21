from __future__ import annotations

from dataclasses import dataclass, field

from ...base.models import (
    ModelCapability,
    ModelInfo,
    ProviderTier,
)


@dataclass(frozen=True)
class YiModel:
    model_id: str
    display_name: str
    context_window: int
    max_output_tokens: int
    quality_score: float
    latency_ms: float | None = None
    input_cost_per_1m_tokens: float = 0.0
    output_cost_per_1m_tokens: float = 0.0
    aliases: tuple[str, ...] = ()
    enabled: bool = True
    capabilities: frozenset[ModelCapability] = field(
        default_factory=lambda: frozenset(
            {
                ModelCapability.CHAT,
                ModelCapability.CODE,
                ModelCapability.REASONING,
                ModelCapability.STREAMING,
                ModelCapability.STRUCTURED_OUTPUT,
                ModelCapability.JSON,
            }
        )
    )

    def to_model_info(self) -> ModelInfo:
        return ModelInfo(
            id=self.model_id,
            provider="yi",
            aliases=self.aliases,
            tier=ProviderTier.MLM,
            capabilities=self.capabilities,
            context_window=self.context_window,
            max_output_tokens=self.max_output_tokens,
            input_cost_per_1m_tokens=self.input_cost_per_1m_tokens,
            output_cost_per_1m_tokens=self.output_cost_per_1m_tokens,
            estimated_latency_ms=self.latency_ms,
            quality_score=self.quality_score,
            enabled=self.enabled,
            metadata={"source": "yi_provider"},
        )


DEFAULT_YI_MODELS = (
    YiModel(
        model_id="01-ai/Yi-1.5-9B-Chat",
        display_name="Yi 1.5 9B Chat",
        context_window=32768,
        max_output_tokens=4096,
        quality_score=0.84,
        aliases=(
            "Yi-1.5-9B-Chat",
            "yi-1.5-9b",
            "yi-9b",
        ),
    ),
    YiModel(
        model_id="01-ai/Yi-1.5-34B-Chat",
        display_name="Yi 1.5 34B Chat",
        context_window=32768,
        max_output_tokens=4096,
        quality_score=0.90,
        aliases=(
            "Yi-1.5-34B-Chat",
            "yi-1.5-34b",
            "yi-34b",
        ),
    ),
)


def to_model_info(model: YiModel) -> ModelInfo:
    return model.to_model_info()


__all__ = [
    "YiModel",
    "DEFAULT_YI_MODELS",
    "to_model_info",
]
