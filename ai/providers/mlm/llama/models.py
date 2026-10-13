from __future__ import annotations

from dataclasses import dataclass, field

from ...base.models import (
    ModelCapability,
    ModelInfo,
    ProviderTier,
)


@dataclass(frozen=True)
class LlamaModel:
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
            provider="llama",
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
            metadata={"source": "llama_provider"},
        )


DEFAULT_LLAMA_MODELS = (
    LlamaModel(
        model_id="meta-llama/Llama-3.1-8B-Instruct",
        display_name="Llama 3.1 8B Instruct",
        context_window=131072,
        max_output_tokens=8192,
        quality_score=0.87,
        aliases=(
            "Llama-3.1-8B-Instruct",
            "llama-3.1-8b",
            "llama-8b",
        ),
    ),
    LlamaModel(
        model_id="meta-llama/Llama-3.1-70B-Instruct",
        display_name="Llama 3.1 70B Instruct",
        context_window=131072,
        max_output_tokens=8192,
        quality_score=0.94,
        aliases=(
            "Llama-3.1-70B-Instruct",
            "llama-3.1-70b",
            "llama-70b",
        ),
    ),
)


def to_model_info(model: LlamaModel) -> ModelInfo:
    return model.to_model_info()


__all__ = [
    "LlamaModel",
    "DEFAULT_LLAMA_MODELS",
    "to_model_info",
]
