from __future__ import annotations

from ...base.models import (
    ModelCapability,
    ModelInfo,
    ProviderTier,
)


TINYLLAMA_MODELS: tuple[ModelInfo, ...] = (
    ModelInfo(
        id="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
        provider="tinyllama",
        aliases=(
            "TinyLlama-1.1B-Chat-v1.0",
            "tinyllama-1.1b",
            "tinyllama-1.1b-chat",
        ),
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
        context_window=2048,
        max_output_tokens=2048,
        input_cost_per_1m_tokens=0.0,
        output_cost_per_1m_tokens=0.0,
        estimated_latency_ms=100.0,
        quality_score=0.80,
        enabled=True,
        metadata={
            "family": "TinyLlama",
            "local": True,
            "open_model": True,
            "organization": "TinyLlama",
        },
    ),
)


TINYLLAMA_MODEL_DEFINITIONS = TINYLLAMA_MODELS


def get_models() -> tuple[ModelInfo, ...]:
    return TINYLLAMA_MODELS


__all__ = [
    "TINYLLAMA_MODELS",
    "TINYLLAMA_MODEL_DEFINITIONS",
    "get_models",
]
