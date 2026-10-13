from __future__ import annotations

from dataclasses import dataclass

from ai.providers.base.models import ModelCapability, ModelInfo, ProviderTier


@dataclass(frozen=True)
class MistralModel:
    model_id: str
    display_name: str
    context_window: int
    max_output_tokens: int
    quality_score: float | None = None
    enabled: bool = True


_COMMON_CAPABILITIES = (
    ModelCapability.CHAT,
    ModelCapability.CODE,
    ModelCapability.REASONING,
    ModelCapability.STREAMING,
    ModelCapability.TOOL_USE,
    ModelCapability.STRUCTURED_OUTPUT,
    ModelCapability.JSON,
)


DEFAULT_MISTRAL_MODELS = (
    MistralModel(
        model_id="mistral-small-latest",
        display_name="Mistral Small",
        context_window=32768,
        max_output_tokens=8192,
        quality_score=0.88,
    ),
    MistralModel(
        model_id="mistral-medium-latest",
        display_name="Mistral Medium",
        context_window=32768,
        max_output_tokens=8192,
        quality_score=0.91,
    ),
)


def to_model_info(model: MistralModel) -> ModelInfo:
    return ModelInfo(
        id=model.model_id,
        provider="mistral",
        aliases=(),
        tier=ProviderTier.MLM,
        capabilities=_COMMON_CAPABILITIES,
        context_window=model.context_window,
        max_output_tokens=model.max_output_tokens,
        input_cost_per_1m_tokens=0.0,
        output_cost_per_1m_tokens=0.0,
        estimated_latency_ms=None,
        quality_score=model.quality_score,
        enabled=model.enabled,
        metadata={"source": "mistral_provider"},
    )
