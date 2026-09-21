from __future__ import annotations

from ...base.models import (
    ModelCapability,
    ModelInfo,
    ProviderTier,
)


LLAMA_MODEL_DEFINITIONS = [
    {
        "id": "meta-llama/Llama-3.2-1B-Instruct",
        "aliases": [
            "Llama-3.2-1B-Instruct",
            "llama-3.2-1b",
            "llama-1b",
        ],
        "context_window": 131072,
        "max_output_tokens": 8192,
        "input_cost_per_1m_tokens": 0.0,
        "output_cost_per_1m_tokens": 0.0,
        "estimated_latency_ms": 120.0,
        "quality_score": 0.86,
    },
    {
        "id": "meta-llama/Llama-3.2-3B-Instruct",
        "aliases": [
            "Llama-3.2-3B-Instruct",
            "llama-3.2-3b",
            "llama-3b",
        ],
        "context_window": 131072,
        "max_output_tokens": 8192,
        "input_cost_per_1m_tokens": 0.0,
        "output_cost_per_1m_tokens": 0.0,
        "estimated_latency_ms": 180.0,
        "quality_score": 0.89,
    },
]


LLAMA_MODELS: list[ModelInfo] = [
    ModelInfo(
        id=item["id"],
        provider="llama",
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
            "family": "Llama",
            "execution": "local",
            "open_model": True,
            "organization": "Meta",
        },
    )
    for item in LLAMA_MODEL_DEFINITIONS
]


__all__ = [
    "LLAMA_MODEL_DEFINITIONS",
    "LLAMA_MODELS",
]
