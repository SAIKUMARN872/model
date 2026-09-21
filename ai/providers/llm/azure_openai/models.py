cd "C:\Users\pamar\Downloads\model-main\model-main"

@'
from __future__ import annotations

from dataclasses import dataclass

from ai.providers.base import (
    ModelCapability,
    ModelInfo,
    ProviderTier,
)


@dataclass(frozen=True)
class AzureDeployment:
    """
    Represents one Azure OpenAI deployment.

    deployment_name:
        The name used by Azure for the deployed model.
        This is the value ModelNow sends as `model`.

    model_name:
        The underlying model family/name for metadata and routing.
    """

    deployment_name: str
    model_name: str

    tier: ProviderTier = ProviderTier.LLM

    context_window: int = 0
    max_output_tokens: int = 0

    input_cost_per_1m_tokens: float = 0.0
    output_cost_per_1m_tokens: float = 0.0

    estimated_latency_ms: float | None = None
    quality_score: float | None = None

    enabled: bool = True

    @property
    def model_info(self) -> ModelInfo:
        """
        Convert Azure deployment metadata into
        ModelNow's normalized ModelInfo.
        """

        return ModelInfo(
            id=self.deployment_name,
            provider="azure_openai",
            aliases=(self.model_name,),
            tier=self.tier,
            capabilities=frozenset(
                {
                    ModelCapability.CHAT,
                    ModelCapability.STREAMING,
                    ModelCapability.TOOL_USE,
                    ModelCapability.STRUCTURED_OUTPUT,
                }
            ),
            context_window=self.context_window,
            max_output_tokens=self.max_output_tokens,
            input_cost_per_1m_tokens=self.input_cost_per_1m_tokens,
            output_cost_per_1m_tokens=self.output_cost_per_1m_tokens,
            estimated_latency_ms=self.estimated_latency_ms,
            quality_score=self.quality_score,
            enabled=self.enabled,
        )


__all__ = ["AzureDeployment"]
'@ | Set-Content ".\ai\providers\llm\azure_openai\models.py" -Encoding UTF8