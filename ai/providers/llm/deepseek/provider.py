from __future__ import annotations

import time
from collections.abc import AsyncIterator

from ...base.models import (
    ModelCapability,
    ModelInfo,
    ProviderHealth,
    ProviderMetadata,
    ProviderStatus,
    ProviderTier,
)
from ...base.provider import BaseProvider
from ...base.request import ChatRequest
from ...base.response import ChatResponse, StreamChunk

from .chat import DeepSeekChat
from .client import DeepSeekClient
from .config import DeepSeekConfig
from .models import DEEPSEEK_MODELS
from .stream import DeepSeekStream


class DeepSeekProvider(BaseProvider):
    """ModelNow provider adapter for DeepSeek."""

    name = "deepseek"
    version = "1.0"

    def __init__(
        self,
        config: DeepSeekConfig | None = None,
    ) -> None:
        deepseek_config = config or DeepSeekConfig.from_env()

        super().__init__(
            _to_base_config(deepseek_config)
        )

        self.deepseek_config = deepseek_config
        self.client = DeepSeekClient(
            deepseek_config
        )
        self.chat_adapter = DeepSeekChat(
            self.client
        )
        self.stream_adapter = DeepSeekStream(
            self.client
        )

    @property
    def metadata(self) -> ProviderMetadata:
        return ProviderMetadata(
            provider_id="deepseek",
            display_name="DeepSeek",
            version=self.version,
            tier_support=frozenset(
                {ProviderTier.LLM}
            ),
            capabilities=frozenset(
                {
                    ModelCapability.CHAT,
                    ModelCapability.REASONING,
                    ModelCapability.CODE,
                    ModelCapability.STREAMING,
                    ModelCapability.TOOL_USE,
                    ModelCapability.STRUCTURED_OUTPUT,
                }
            ),
            enterprise_ready=True,
            streaming_supported=True,
            tool_use_supported=True,
        )

    async def initialize(self) -> None:
        self.ensure_enabled()
        self._initialized = True

    async def close(self) -> None:
        self._initialized = False

    async def health_check(self) -> ProviderHealth:
        if not self.deepseek_config.enabled:
            return ProviderHealth(
                healthy=False,
                provider="deepseek",
                status=ProviderStatus.DISABLED,
                message="DeepSeek provider is disabled.",
                checked_at=time.time(),
            )

        if not self.deepseek_config.api_key:
            return ProviderHealth(
                healthy=False,
                provider="deepseek",
                status=ProviderStatus.UNAVAILABLE,
                message="DEEPSEEK_API_KEY is not configured.",
                checked_at=time.time(),
            )

        return ProviderHealth(
            healthy=True,
            provider="deepseek",
            status=ProviderStatus.READY,
            message="DeepSeek configuration is available.",
            checked_at=time.time(),
        )

    async def list_models(self) -> list[ModelInfo]:
        models: list[ModelInfo] = []

        for model in DEEPSEEK_MODELS.values():
            capabilities = {
                ModelCapability.CHAT,
                ModelCapability.STREAMING,
            }

            if model.supports_tools:
                capabilities.add(
                    ModelCapability.TOOL_USE
                )

            if model.supports_reasoning:
                capabilities.add(
                    ModelCapability.REASONING
                )

            if model.supports_structured_output:
                capabilities.add(
                    ModelCapability.STRUCTURED_OUTPUT
                )

            models.append(
                ModelInfo(
                    id=model.model_id,
                    provider="deepseek",
                    aliases=(
                        model.display_name,
                    ),
                    tier=ProviderTier.LLM,
                    capabilities=frozenset(
                        capabilities
                    ),
                    context_window=model.context_window,
                    max_output_tokens=model.max_output_tokens,
                    estimated_latency_ms=None,
                    quality_score=None,
                    enabled=True,
                    metadata={
                        "display_name": model.display_name,
                        "supports_streaming": (
                            model.supports_streaming
                        ),
                        "supports_tools": (
                            model.supports_tools
                        ),
                        "supports_reasoning": (
                            model.supports_reasoning
                        ),
                        "supports_vision": (
                            model.supports_vision
                        ),
                    },
                )
            )

        return models

    async def chat(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        self.ensure_initialized()
        return await self.chat_adapter.create(
            request
        )

    async def stream(
        self,
        request: ChatRequest,
    ) -> AsyncIterator[StreamChunk]:
        self.ensure_initialized()

        async for chunk in self.stream_adapter.stream(
            request
        ):
            yield chunk


def _to_base_config(
    config: DeepSeekConfig,
):
    from ...base.config import ProviderConfig

    return ProviderConfig(
        provider_id=config.provider_id,
        api_key=config.api_key,
        base_url=config.base_url,
        timeout_seconds=config.timeout_seconds,
        max_retries=config.max_retries,
        enabled=config.enabled,
    )


__all__ = ["DeepSeekProvider"]
