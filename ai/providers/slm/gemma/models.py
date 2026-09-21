from __future__ import annotations

from ...base.models import ModelCapability, ModelInfo, ProviderTier


GEMMA_MODEL_DEFINITIONS = [
    {
        "id": "google/gemma-3-1b-it",
        "aliases": ["gemma-3-1b-it", "gemma-1b"],
        "context_window": 32768,
        "max_output_tokens": 8192,
        "input_cost_per_1m_tokens": 0.0,
        "output_cost_per_1m_tokens": 0.0,
        "estimated_latency_ms": 120.0,
        "quality_score": 0.88,
    },
    {
        "id": "google/gemma-3-4b-it",
        "aliases": ["gemma-3-4b-it", "gemma-4b"],
        "context_window": 32768,
        "max_output_tokens": 8192,
        "input_cost_per_1m_tokens": 0.0,
        "output_cost_per_1m_tokens": 0.0,
        "estimated_latency_ms": 220.0,
        "quality_score": 0.92,
    },
]


GEMMA_MODELS: list[ModelInfo] = [
    ModelInfo(
        id=item["id"],
        provider="gemma",
        aliases=item["aliases"],
        tier=ProviderTier.SLM,
        capabilities=[
            ModelCapability.CHAT,
            ModelCapability.REASONING,
            ModelCapability.CODE,
            ModelCapability.STREAMING,
            ModelCapability.LONG_CONTEXT,
            ModelCapability.STRUCTURED_OUTPUT,
            ModelCapability.JSON,
        ],
        context_window=item["context_window"],
        max_output_tokens=item["max_output_tokens"],
        input_cost_per_1m_tokens=item["input_cost_per_1m_tokens"],
        output_cost_per_1m_tokens=item["output_cost_per_1m_tokens"],
        estimated_latency_ms=item["estimated_latency_ms"],
        quality_score=item["quality_score"],
        enabled=True,
        metadata={
            "family": "Gemma",
            "execution": "local",
            "open_model": True,
        },
    )
    for item in GEMMA_MODEL_DEFINITIONS
]