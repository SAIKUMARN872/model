from __future__ import annotations

from ...base.config import ProviderConfig
from ...base.models import (
    ModelCapability,
    ModelInfo,
    ProviderHealth,
    ProviderMetadata,
    ProviderStatus,
)
from ...base.provider import BaseProvider
from ...base.request import ChatRequest
from ...base.response import ChatResponse

from .chat import DeepSeekChat
from .client import DeepSeekClient
from .config import DeepSeekConfig
from .models import DEFAULT_DEEPSEEK_MODELS
from .stream import DeepSeekStream


class DeepSeekProvider(BaseProvider):
    """DeepSeek provider implementation."""

    def __init__(
        self,
        config: ProviderConfig | None = None,
        deepseek_config: DeepSeekConfig | None = None,
    ) -> None:
        self.config = config or ProviderConfig(
            provider_id="deepseek"
        )
        self.deepseek_config = (
            deepseek_config or DeepSeekConfig.from_env()
        )
        self.client = DeepSeekClient(
            self.config,
            self.deepseek_config,
        )
        self.chat_client = DeepSeekChat(self.client)
        self.stream_client = DeepSeekStream(self.client)
        self._initialized = False

    @property
    def name(self) -> str:
        return "deepseek"

    @property
    def version(self) -> str:
        return "1.0.0"

    @property
    def metadata(self) -> ProviderMetadata:
        return ProviderMetadata(
            provider_id="deepseek",
            display_name="DeepSeek",
            version=self.version,
            tier_support=frozenset({"mlm"}),
            capabilities=frozenset({
                ModelCapability.CHAT,
                ModelCapability.REASONING,
                ModelCapability.CODE,
                ModelCapability.STREAMING,
                ModelCapability.TOOL_USE,
                ModelCapability.STRUCTURED_OUTPUT,
                ModelCapability.JSON,
            }),
            enterprise_ready=True,
            streaming_supported=True,
            tool_use_supported=True,
        )

    async def initialize(self) -> None:
        self.ensure_enabled()
        self._initialized = True

    async def close(self) -> None:
        await self.client.close()
        self._initialized = False

    async def health_check(self) -> ProviderHealth:
        if not self.config.enabled:
            return ProviderHealth(
                healthy=False,
                provider=self.name,
                status=ProviderStatus.DISABLED,
                message="DeepSeek provider is disabled.",
            )

        if not self.deepseek_config.api_key:
            return ProviderHealth(
                healthy=False,
                provider=self.name,
                status=ProviderStatus.UNAVAILABLE,
                message="DEEPSEEK_API_KEY is not configured.",
            )

        return ProviderHealth(
            healthy=True,
            provider=self.name,
            status=ProviderStatus.READY,
            message="DeepSeek configuration is available.",
        )

    async def list_models(self) -> list[ModelInfo]:
        return [
            ModelInfo(
                id=model.model_id,
                provider="deepseek",
                aliases=model.aliases,
                tier=model.tier,
                capabilities=model.capabilities,
                context_window=model.context_window,
                max_output_tokens=model.max_output_tokens,
                input_cost_per_1m_tokens=
                    model.input_cost_per_1k_tokens * 1000,
                output_cost_per_1m_tokens=
                    model.output_cost_per_1k_tokens * 1000,
                estimated_latency_ms=model.latency_ms,
                quality_score=model.quality_score,
                enabled=model.enabled,
            )
            for model in DEFAULT_DEEPSEEK_MODELS
        ]

    async def chat(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        self.ensure_enabled()
        self.ensure_initialized()
        return await self.chat_client.complete(request)

    async def stream(
        self,
        request: ChatRequest,
    ):
        self.ensure_enabled()
        self.ensure_initialized()
        async for chunk in self.stream_client.stream(request):
            yield chunk

    def supports_model(self, model_id: str) -> bool:
        return any(
            model.model_id == model_id
            or model_id in model.aliases
            for model in DEFAULT_DEEPSEEK_MODELS
        )


__all__ = ["DeepSeekProvider"]
