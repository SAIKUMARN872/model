from __future__ import annotations

from ...base.models import (
    ModelCapability,
    ModelInfo,
    ProviderTier,
)


MISTRAL_MODEL_DEFINITIONS = [
    {
        "id": "mistralai/Mistral-7B-Instruct-v0.3",
        "aliases": [
            "Mistral-7B-Instruct-v0.3",
            "mistral-7b",
            "mistral-7b-instruct",
        ],
        "context_window": 32768,
        "max_output_tokens": 8192,
        "input_cost_per_1m_tokens": 0.0,
        "output_cost_per_1m_tokens": 0.0,
        "estimated_latency_ms": 250.0,
        "quality_score": 0.90,
    },
]


MISTRAL_MODELS: list[ModelInfo] = [
    ModelInfo(
        id=item["id"],
        provider="mistral",
        aliases=tuple(item["aliases"]),
        tier=ProviderTier.SLM,
        capabilities=frozenset(
            {
                ModelCapability.CHAT,
                ModelCapability.REASONING,
                ModelCapability.CODE,
                ModelCapability.STREAMING,
                ModelCapability.LONG_CONTEXT,
                ModelCapability.STRUCTURED_OUTPUT,
                ModelCapability.JSON,
            }
        ),
        context_window=item["context_window"],
        max_output_tokens=item["max_output_tokens"],
        input_cost_per_1m_tokens=item["input_cost_per_1m_tokens"],
        output_cost_per_1m_tokens=item["output_cost_per_1m_tokens"],
        estimated_latency_ms=item["estimated_latency_ms"],
        quality_score=item["quality_score"],
        enabled=True,
        metadata={
            "family": "Mistral",
            "execution": "local",
            "open_model": True,
            "organization": "Mistral AI",
        },
    )
    for item in MISTRAL_MODEL_DEFINITIONS
]


__all__ = [
    "MISTRAL_MODEL_DEFINITIONS",
    "MISTRAL_MODELS",
]
