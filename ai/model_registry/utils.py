from __future__ import annotations

from collections.abc import Iterable

from ..providers.base.models import (
    ModelCapability as ProviderModelCapability,
    ModelInfo,
    ProviderTier,
)

from .capabilities.features import ModelFeature
from .models import (
    ModelCapabilities,
    ModelPricing,
    ModelRecord,
    ModelTier,
)


_TIER_MAP: dict[ProviderTier, ModelTier] = {
    ProviderTier.SLM: ModelTier.SLM,
    ProviderTier.MLM: ModelTier.MLM,
    ProviderTier.LLM: ModelTier.LLM,
}


_FEATURE_MAP: dict[
    ProviderModelCapability,
    ModelFeature,
] = {
    ProviderModelCapability.CHAT: ModelFeature.CHAT,
    ProviderModelCapability.REASONING: ModelFeature.REASONING,
    ProviderModelCapability.CODE: ModelFeature.CODE,
    ProviderModelCapability.VISION: ModelFeature.VISION,
    ProviderModelCapability.AUDIO: ModelFeature.AUDIO,
    ProviderModelCapability.TOOL_USE: ModelFeature.TOOL_USE,
    ProviderModelCapability.STRUCTURED_OUTPUT: (
        ModelFeature.STRUCTURED_OUTPUT
    ),
    ProviderModelCapability.STREAMING: ModelFeature.STREAMING,
    ProviderModelCapability.LONG_CONTEXT: ModelFeature.LONG_CONTEXT,
    ProviderModelCapability.AGENTIC: ModelFeature.AGENTIC,
}


def normalize_tier(
    tier: ProviderTier,
) -> ModelTier:
    if not isinstance(
        tier,
        ProviderTier,
    ):
        raise TypeError(
            "tier must be a ProviderTier"
        )

    return _TIER_MAP[tier]


def normalize_features(
    capabilities: Iterable[ProviderModelCapability],
) -> frozenset[ModelFeature]:
    values = set(capabilities)

    if not all(
        isinstance(
            capability,
            ProviderModelCapability,
        )
        for capability in values
    ):
        raise TypeError(
            "capabilities must contain only "
            "provider ModelCapability values"
        )

    return frozenset(
        _FEATURE_MAP[capability]
        for capability in values
        if capability in _FEATURE_MAP
    )


def model_info_to_record(
    model: ModelInfo,
) -> ModelRecord:
    if not isinstance(
        model,
        ModelInfo,
    ):
        raise TypeError(
            "model must be a ModelInfo"
        )

    features = normalize_features(
        model.capabilities
    )

    return ModelRecord(
        provider=model.provider,
        model_id=model.id,
        display_name=model.id,
        tier=normalize_tier(model.tier),
        context_window=model.context_window,
        max_output_tokens=model.max_output_tokens,
        pricing=ModelPricing(
            input_per_1m_tokens=model.input_cost_per_1m_tokens,
            output_per_1m_tokens=model.output_cost_per_1m_tokens,
        ),
        capabilities=ModelCapabilities(
            chat=ModelFeature.CHAT in features,
            reasoning=ModelFeature.REASONING in features,
            code=ModelFeature.CODE in features,
            vision=ModelFeature.VISION in features,
            audio=ModelFeature.AUDIO in features,
            tool_use=ModelFeature.TOOL_USE in features,
            structured_output=(
                ModelFeature.STRUCTURED_OUTPUT in features
            ),
            streaming=ModelFeature.STREAMING in features,
            long_context=ModelFeature.LONG_CONTEXT in features,
            agentic=ModelFeature.AGENTIC in features,
        ),
        latency_ms=model.estimated_latency_ms,
        quality_score=model.quality_score,
        aliases=model.aliases,
        enabled=model.enabled,
        available=model.enabled,
        metadata=model.metadata,
    )


__all__ = [
    "normalize_tier",
    "normalize_features",
    "model_info_to_record",
]

