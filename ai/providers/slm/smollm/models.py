from __future__ import annotations

from ...base.models import (
    ModelCapability,
    ModelInfo,
    ProviderTier,
)


SMOLLM_MODEL_DEFINITIONS = [
    {
        "id": "HuggingFaceTB/SmolLM-135M-Instruct",
        "aliases": [
            "SmolLM-135M-Instruct",
            "smollm-135m",
            "smollm-135m-instruct",
        ],
        "context_window": 2048,
        "max_output_tokens": 2048,
        "input_cost_per_1m_tokens": 0.0,
        "output_cost_per_1m_tokens": 0.0,
        "estimated_latency_ms": 60.0,
        "quality_score": 0.72,
    },
    {
        "id": "HuggingFaceTB/SmolLM-360M-Instruct",
        "aliases": [
            "SmolLM-360M-Instruct",
            "smollm-360m",
            "smollm-360m-instruct",
        ],
        "context_window": 2048,
        "max_output_tokens": 2048,
        "input_cost_per_1m_tokens": 0.0,
        "output_cost_per_1m_tokens": 0.0,
        "estimated_latency_ms": 80.0,
        "quality_score": 0.76,
    },
]


SMOLLM_MODELS: list[ModelInfo] = [
    ModelInfo(
        id=item["id"],
        provider="smollm",
        aliases=tuple(item["aliases"]),
        tier=ProviderTier.SLM,
        capabilities=frozenset(
            {
                ModelCapability.CHAT,
                ModelCapability.REASONING,
                ModelCapability.CODE,
                ModelCapability.STREAMING,
                ModelCapability.STRUCTURED_OUTPUT,
                ModelCapability.JSON,
            }
        ),
        context_window=item["context_window"],
        max_output_tokens=item["max_output_tokens"],
        input_cost_per_1m_tokens=item[
            "input_cost_per_1m_tokens"
        ],
        output_cost_per_1m_tokens=item[
            "output_cost_per_1m_tokens"
        ],
        estimated_latency_ms=item[
            "estimated_latency_ms"
        ],
        quality_score=item["quality_score"],
        enabled=True,
        metadata={
            "family": "SmolLM",
            "execution": "local",
            "open_model": True,
            "organization": "Hugging Face",
        },
    )
    for item in SMOLLM_MODEL_DEFINITIONS
]


__all__ = [
    "SMOLLM_MODEL_DEFINITIONS",
    "SMOLLM_MODELS",
]
