from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ai.providers.base.models import (
    ModelCapability,
    ModelInfo,
    ProviderTier,
)


@dataclass(slots=True)
class OpenRouterModel:
    id: str
    name: str = ""
    context_length: int = 0
    max_output_tokens: int = 0

    input_cost_per_1m_tokens: float = 0.0
    output_cost_per_1m_tokens: float = 0.0

    architecture: dict[str, Any] = field(default_factory=dict)
    top_provider: dict[str, Any] = field(default_factory=dict)

    supported_parameters: tuple[str, ...] = ()
    metadata: dict[str, Any] = field(default_factory=dict)

    @property
    def model_name(self) -> str:
        return self.id

    def to_model_info(
        self,
        tier: ProviderTier = ProviderTier.LLM,
    ) -> ModelInfo:
        capabilities = {
            ModelCapability.CHAT,
            ModelCapability.STREAMING,
        }

        params = set(self.supported_parameters)

        if "tools" in params:
            capabilities.add(ModelCapability.TOOL_USE)

        if "response_format" in params:
            capabilities.add(ModelCapability.STRUCTURED_OUTPUT)

        if "json_schema" in params or "structured_outputs" in params:
            capabilities.add(ModelCapability.JSON)

        architecture_input = str(
            self.architecture.get("input", "")
        ).lower()

        if "image" in architecture_input:
            capabilities.add(ModelCapability.VISION)

        return ModelInfo(
            id=self.id,
            provider="openrouter",
            aliases=(),
            tier=tier,
            capabilities=frozenset(capabilities),
            context_window=self.context_length,
            max_output_tokens=self.max_output_tokens,
            input_cost_per_1m_tokens=self.input_cost_per_1m_tokens,
            output_cost_per_1m_tokens=self.output_cost_per_1m_tokens,
            estimated_latency_ms=self.metadata.get(
                "estimated_latency_ms"
            ),
            quality_score=self.metadata.get("quality_score"),
            enabled=True,
            metadata={
                "name": self.name,
                "architecture": self.architecture,
                "top_provider": self.top_provider,
                "supported_parameters": self.supported_parameters,
                **self.metadata,
            },
        )


# Representative OpenRouter models used for offline provider
# construction/model matching tests.
#
# OpenRouter model IDs are author/slug identifiers.
DEFAULT_OPENROUTER_MODELS: tuple[OpenRouterModel, ...] = (
    OpenRouterModel(
        id="openai/gpt-4o",
        name="GPT-4o",
        context_length=128000,
        supported_parameters=(
            "temperature",
            "top_p",
            "tools",
            "response_format",
        ),
    ),
    OpenRouterModel(
        id="anthropic/claude-sonnet-4",
        name="Claude Sonnet 4",
        context_length=200000,
        supported_parameters=(
            "temperature",
            "top_p",
            "tools",
            "response_format",
        ),
    ),
    OpenRouterModel(
        id="google/gemini-2.5-pro",
        name="Gemini 2.5 Pro",
        context_length=1048576,
        supported_parameters=(
            "temperature",
            "top_p",
            "tools",
            "response_format",
        ),
    ),
)
