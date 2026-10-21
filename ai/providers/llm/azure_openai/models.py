from __future__ import annotations

from dataclasses import dataclass

from ai.providers.base.models import ModelCapability, ModelInfo, ProviderTier


@dataclass(frozen=True)
class AzureDeployment:
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
        return ModelInfo(
            id=self.deployment_name,
            provider="azure_openai",
            aliases=(self.model_name, self.deployment_name),
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
            metadata={
                "model_name": self.model_name,
                "deployment_name": self.deployment_name,
                "provider": "azure_openai",
            },
        )


DEFAULT_AZURE_DEPLOYMENTS: tuple[AzureDeployment, ...] = (
    AzureDeployment(
        deployment_name="gpt-5",
        model_name="gpt-5",
        tier=ProviderTier.LLM,
        context_window=400000,
        max_output_tokens=128000,
        estimated_latency_ms=900.0,
        quality_score=0.99,
    ),
    AzureDeployment(
        deployment_name="gpt-5-mini",
        model_name="gpt-5-mini",
        tier=ProviderTier.MLM,
        context_window=400000,
        max_output_tokens=128000,
        estimated_latency_ms=450.0,
        quality_score=0.93,
    ),
    AzureDeployment(
        deployment_name="gpt-4.1",
        model_name="gpt-4.1",
        tier=ProviderTier.LLM,
        context_window=1048576,
        max_output_tokens=32768,
        estimated_latency_ms=700.0,
        quality_score=0.96,
    ),
)
