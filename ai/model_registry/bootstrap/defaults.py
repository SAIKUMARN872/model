from __future__ import annotations

from ai.model_registry.models import (
    ModelCapabilities,
    ModelPricing,
    ModelRecord,
    ModelTier,
)


def default_models() -> list[ModelRecord]:
    return [
        ModelRecord(
            provider="ollama",
            model_id="qwen3:1.7b",
            display_name="Qwen 3 1.7B",
            tier=ModelTier.SLM,
            context_window=32768,
            pricing=ModelPricing(
                input_per_1m_tokens=0.0,
                output_per_1m_tokens=0.0,
            ),
            capabilities=ModelCapabilities(
                chat=True,
                reasoning=False,
                code=True,
                streaming=True,
            ),
            latency_ms=None,
            quality_score=0.75,
            aliases=("qwen-small", "qwen3-1.7b"),
        ),
        ModelRecord(
            provider="deepseek",
            model_id="deepseek-chat",
            display_name="DeepSeek Chat",
            tier=ModelTier.MLM,
            context_window=65536,
            pricing=ModelPricing(
                input_per_1m_tokens=0.28,
                output_per_1m_tokens=0.42,
            ),
            capabilities=ModelCapabilities(
                chat=True,
                reasoning=True,
                code=True,
                streaming=True,
                structured_output=True,
            ),
            latency_ms=None,
            quality_score=0.90,
            aliases=("deepseek-mid", "deepseek-code-mid"),
        ),
        ModelRecord(
            provider="openai",
            model_id="configured-foundation-model",
            display_name="Configured Foundation Model",
            tier=ModelTier.LLM,
            context_window=128000,
            pricing=ModelPricing(
                input_per_1m_tokens=5.0,
                output_per_1m_tokens=15.0,
            ),
            capabilities=ModelCapabilities(
                chat=True,
                reasoning=True,
                code=True,
                tool_use=True,
                structured_output=True,
                streaming=True,
                long_context=True,
                agentic=True,
            ),
            latency_ms=None,
            quality_score=0.99,
            aliases=("foundation-reasoning",),
        ),
    ]


__all__ = ["default_models"]