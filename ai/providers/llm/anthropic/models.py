Set-Content ".\ai\providers\llm\anthropic\models.py" @'
from __future__ import annotations

from dataclasses import dataclass, field

from ai.providers.base.models import ModelCapability, ProviderTier


@dataclass(frozen=True)
class AnthropicModel:
    model_id: str
    display_name: str
    tier: ProviderTier

    context_window: int = 200_000
    max_output_tokens: int = 64_000

    input_cost_per_1k_tokens: float = 0.0
    output_cost_per_1k_tokens: float = 0.0

    latency_ms: float = 0.0
    quality_score: float = 0.0

    capabilities: frozenset[ModelCapability] = field(
        default_factory=frozenset
    )

    aliases: tuple[str, ...] = ()
    enabled: bool = True


_COMMON_CAPABILITIES = frozenset(
    {
        ModelCapability.CHAT,
        ModelCapability.REASONING,
        ModelCapability.CODE,
        ModelCapability.VISION,
        ModelCapability.TOOL_USE,
        ModelCapability.STRUCTURED_OUTPUT,
        ModelCapability.STREAMING,
        ModelCapability.LONG_CONTEXT,
        ModelCapability.AGENTIC,
    }
)


DEFAULT_ANTHROPIC_MODELS = (
    AnthropicModel(
        model_id="claude-opus-5",
        display_name="Claude Opus 5",
        tier=ProviderTier.LLM,
        context_window=1_000_000,
        max_output_tokens=128_000,
        input_cost_per_1k_tokens=0.005,
        output_cost_per_1k_tokens=0.025,
        latency_ms=1400.0,
        quality_score=0.99,
        aliases=("opus", "claude-opus"),
        capabilities=_COMMON_CAPABILITIES,
    ),
    AnthropicModel(
        model_id="claude-sonnet-5",
        display_name="Claude Sonnet 5",
        tier=ProviderTier.MLM,
        context_window=1_000_000,
        max_output_tokens=128_000,
        input_cost_per_1k_tokens=0.002,
        output_cost_per_1k_tokens=0.010,
        latency_ms=700.0,
        quality_score=0.96,
        aliases=("sonnet", "claude-sonnet"),
        capabilities=_COMMON_CAPABILITIES,
    ),
    AnthropicModel(
        model_id="claude-haiku-4-5-20251001",
        display_name="Claude Haiku 4.5",
        tier=ProviderTier.SLM,
        context_window=200_000,
        max_output_tokens=64_000,
        input_cost_per_1k_tokens=0.001,
        output_cost_per_1k_tokens=0.005,
        latency_ms=300.0,
        quality_score=0.88,
        aliases=("haiku", "claude-haiku"),
        capabilities=_COMMON_CAPABILITIES,
    ),
)
'@