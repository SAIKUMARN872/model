from __future__ import annotations

from ...base.models import ModelCapability, ModelInfo, ProviderTier


PHI_MODEL_DEFINITIONS = [
    {
        "id": "microsoft/Phi-3-mini-4k-instruct",
        "aliases": [
            "Phi-3-mini-4k-instruct",
            "phi-3-mini",
            "phi-mini",
        ],
        "context_window": 4096,
        "max_output_tokens": 4096,
        "input_cost_per_1m_tokens": 0.0,
        "output_cost_per_1m_tokens": 0.0,
        "estimated_latency_ms": 200.0,
        "quality_score": 0.87,
    },
]


PHI_MODELS: list[ModelInfo] = [
    ModelInfo(
        id=item["id"],
        provider="phi",
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
        input_cost_per_1m_tokens=item["input_cost_per_1m_tokens"],
        output_cost_per_1m_tokens=item["output_cost_per_1m_tokens"],
        estimated_latency_ms=item["estimated_latency_ms"],
        quality_score=item["quality_score"],
        enabled=True,
        metadata={
            "family": "Phi",
            "execution": "local",
            "open_model": True,
            "organization": "Microsoft",
        },
    )
    for item in PHI_MODEL_DEFINITIONS
]


__all__ = [
    "PHI_MODEL_DEFINITIONS",
    "PHI_MODELS",
]
