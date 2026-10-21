from __future__ import annotations

from dataclasses import dataclass

from ai.providers.base.models import (
    ModelCapability,
    ModelInfo,
    ProviderTier,
)


@dataclass(frozen=True)
class AWSBedrockModel:
    id: str
    name: str
    provider: str = "aws_bedrock"
    tier: ProviderTier = ProviderTier.LLM
    aliases: tuple[str, ...] = ()
    capabilities: frozenset[ModelCapability] = frozenset(
        {
            ModelCapability.CHAT,
            ModelCapability.STREAMING,
        }
    )
    context_window: int = 0
    max_output_tokens: int = 0
    input_cost_per_1m_tokens: float = 0.0
    output_cost_per_1m_tokens: float = 0.0
    estimated_latency_ms: float | None = None
    quality_score: float | None = None
    enabled: bool = True

    def to_model_info(self) -> ModelInfo:
        return ModelInfo(
            id=self.id,
            provider=self.provider,
            aliases=self.aliases,
            tier=self.tier,
            capabilities=self.capabilities,
            context_window=self.context_window,
            max_output_tokens=self.max_output_tokens,
            input_cost_per_1m_tokens=self.input_cost_per_1m_tokens,
            output_cost_per_1m_tokens=self.output_cost_per_1m_tokens,
            estimated_latency_ms=self.estimated_latency_ms,
            quality_score=self.quality_score,
            enabled=self.enabled,
            metadata={
                "name": self.name,
                "aws_region_required": True,
            },
        )


DEFAULT_AWS_BEDROCK_MODELS = (
    AWSBedrockModel(
        id="amazon.nova-micro-v1:0",
        name="Amazon Nova Micro",
        aliases=("nova-micro",),
        context_window=128000,
        max_output_tokens=5000,
        input_cost_per_1m_tokens=0.035,
        output_cost_per_1m_tokens=0.14,
        quality_score=0.78,
    ),
    AWSBedrockModel(
        id="amazon.nova-lite-v1:0",
        name="Amazon Nova Lite",
        aliases=("nova-lite",),
        context_window=300000,
        max_output_tokens=5000,
        input_cost_per_1m_tokens=0.06,
        output_cost_per_1m_tokens=0.24,
        quality_score=0.82,
    ),
    AWSBedrockModel(
        id="amazon.nova-pro-v1:0",
        name="Amazon Nova Pro",
        aliases=("nova-pro",),
        context_window=300000,
        max_output_tokens=5000,
        input_cost_per_1m_tokens=0.80,
        output_cost_per_1m_tokens=3.20,
        quality_score=0.90,
    ),
    AWSBedrockModel(
        id="anthropic.claude-3-5-sonnet-20241022-v2:0",
        name="Claude 3.5 Sonnet v2",
        aliases=("claude-3.5-sonnet",),
        context_window=200000,
        max_output_tokens=8192,
        input_cost_per_1m_tokens=3.00,
        output_cost_per_1m_tokens=15.00,
        quality_score=0.95,
    ),
    AWSBedrockModel(
        id="meta.llama3-8b-instruct-v1:0",
        name="Meta Llama 3 8B Instruct",
        aliases=("llama3-8b",),
        context_window=8192,
        max_output_tokens=2048,
        input_cost_per_1m_tokens=0.22,
        output_cost_per_1m_tokens=0.22,
        quality_score=0.76,
    ),
)


def model_from_bedrock_summary(
    summary: dict,
) -> AWSBedrockModel | None:
    model_id = summary.get("modelId")

    if not model_id:
        return None

    name = (
        summary.get("modelName")
        or model_id
    )

    input_modalities = set(
        summary.get("inputModalities")
        or []
    )

    output_modalities = set(
        summary.get("outputModalities")
        or []
    )

    capabilities = {
        ModelCapability.CHAT,
    }

    if "TEXT" in input_modalities:
        capabilities.add(ModelCapability.CHAT)

    if "TEXT" in output_modalities:
        capabilities.add(ModelCapability.CHAT)

    if summary.get("responseStreamingSupported"):
        capabilities.add(ModelCapability.STREAMING)

    if "IMAGE" in input_modalities:
        capabilities.add(ModelCapability.VISION)

    return AWSBedrockModel(
        id=model_id,
        name=name,
        aliases=(),
        capabilities=frozenset(capabilities),
        enabled=summary.get(
            "modelLifecycle",
            {}
        ).get(
            "status",
            "ACTIVE",
        ) == "ACTIVE",
    )
