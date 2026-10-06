from __future__ import annotations

from ...base.models import (
    ModelCapability,
    ModelInfo,
    ProviderTier,
)


QWEN_MODEL_DEFINITIONS = [
    {
        "id": "Qwen/Qwen2.5-0.5B-Instruct",
        "aliases": [
            "Qwen2.5-0.5B-Instruct",
            "qwen2.5-0.5b",
            "qwen-0.5b",
        ],
        "context_window": 32768,
        "max_output_tokens": 8192,
        "input_cost_per_1m_tokens": 0.0,
        "output_cost_per_1m_tokens": 0.0,
        "estimated_latency_ms": 100.0,
        "quality_score": 0.82,
    },
    {
        "id": "Qwen/Qwen2.5-1.5B-Instruct",
        "aliases": [
            "Qwen2.5-1.5B-Instruct",
            "qwen2.5-1.5b",
            "qwen-1.5b",
        ],
        "context_window": 32768,
        "max_output_tokens": 8192,
        "input_cost_per_1m_tokens": 0.0,
        "output_cost_per_1m_tokens": 0.0,
        "estimated_latency_ms": 140.0,
        "quality_score": 0.86,
    },
]


QWEN_MODELS: list[ModelInfo] = [
    ModelInfo(
        id=item["id"],
        provider="qwen",
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
            "family": "Qwen",
            "execution": "local",
            "open_model": True,
            "organization": "Alibaba Cloud",
        },
    )
    for item in QWEN_MODEL_DEFINITIONS
]


__all__ = [
    "QWEN_MODEL_DEFINITIONS",
    "QWEN_MODELS",
]
