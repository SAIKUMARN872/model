from __future__ import annotations

from ..models import ModelRecord, ModelTier
from ..schemas import ModelQuery


def matches_query(
    model: ModelRecord,
    query: ModelQuery,
) -> bool:
    if query.provider is not None:
        if model.provider.lower() != query.provider.strip().lower():
            return False

    if query.tier is not None:
        if model.tier != query.tier:
            return False

    if query.enabled_only and not model.enabled:
        return False

    if query.available_only and not model.available:
        return False

    capabilities = model.capabilities

    requirements = (
        ("chat", query.requires_chat),
        ("reasoning", query.requires_reasoning),
        ("code", query.requires_code),
        ("vision", query.requires_vision),
        ("audio", query.requires_audio),
        ("tool_use", query.requires_tool_use),
        ("structured_output", query.requires_structured_output),
        ("streaming", query.requires_streaming),
        ("long_context", query.requires_long_context),
        ("agentic", query.requires_agentic),
    )

    for capability, required in requirements:
        if required and not getattr(capabilities, capability):
            return False

    if (
        query.min_context_window is not None
        and model.context_window < query.min_context_window
    ):
        return False

    if (
        query.max_input_cost_per_1m is not None
        and model.pricing.input_per_1m_tokens
        > query.max_input_cost_per_1m
    ):
        return False

    if (
        query.max_output_cost_per_1m is not None
        and model.pricing.output_per_1m_tokens
        > query.max_output_cost_per_1m
    ):
        return False

    if query.max_latency_ms is not None:
        if model.latency_ms is None:
            return False

        if model.latency_ms > query.max_latency_ms:
            return False

    if query.min_quality_score is not None:
        if model.quality_score is None:
            return False

        if model.quality_score < query.min_quality_score:
            return False

    return True


def filter_models(
    models: list[ModelRecord],
    query: ModelQuery,
) -> list[ModelRecord]:
    return [
        model
        for model in models
        if matches_query(model, query)
    ]


__all__ = [
    "matches_query",
    "filter_models",
]
