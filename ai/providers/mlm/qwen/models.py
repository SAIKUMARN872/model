from __future__ import annotations

from dataclasses import dataclass, field

from ...base.models import (
    ModelCapability,
    ModelInfo,
    ProviderTier,
)


@dataclass(frozen=True)
class QwenModel:
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
            provider="qwen",
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
            metadata={"source": "qwen_provider"},
        )


DEFAULT_QWEN_MODELS = (
    QwenModel(
        model_id="Qwen/Qwen3-8B",
        display_name="Qwen3 8B",
        context_window=32768,
        max_output_tokens=8192,
        quality_score=0.88,
        aliases=(
            "Qwen3-8B",
            "qwen3-8b",
            "qwen-8b",
        ),
    ),
    QwenModel(
        model_id="Qwen/Qwen3-14B",
        display_name="Qwen3 14B",
        context_window=32768,
        max_output_tokens=8192,
        quality_score=0.92,
        aliases=(
            "Qwen3-14B",
            "qwen3-14b",
            "qwen-14b",
        ),
    ),
)


def to_model_info(model: QwenModel) -> ModelInfo:
    return model.to_model_info()


__all__ = [
    "QwenModel",
    "DEFAULT_QWEN_MODELS",
    "to_model_info",
]
