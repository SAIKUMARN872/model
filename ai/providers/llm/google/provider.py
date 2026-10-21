from __future__ import annotations

import time
from collections.abc import AsyncIterator

from ...base.config import ProviderConfig
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

from .chat import GoogleChat
from .client import GoogleClient
from .config import GoogleConfig
from .models import GOOGLE_MODELS
from .stream import GoogleStream


class GoogleProvider(BaseProvider):
    """ModelNow provider adapter for Google Gemini."""

    name = "google"
    version = "1.0"

    def __init__(
        self,
        config: GoogleConfig | None = None,
    ) -> None:
        google_config = (
            config
            or GoogleConfig.from_env()
        )

        super().__init__(
            _to_base_config(
                google_config
            )
        )

        self.google_config = google_config

        self.client = GoogleClient(
            google_config
        )

        self.chat_adapter = GoogleChat(
            self.client
        )

        self.stream_adapter = GoogleStream(
            self.client
        )

    @property
    def metadata(
        self,
    ) -> ProviderMetadata:
        return ProviderMetadata(
            provider_id="google",
            display_name="Google",
            version=self.version,
            tier_support=frozenset(
                {ProviderTier.LLM}
            ),
            capabilities=frozenset(
                {
                    ModelCapability.CHAT,
                    ModelCapability.REASONING,
                    ModelCapability.CODE,
                    ModelCapability.VISION,
                    ModelCapability.AUDIO,
                    ModelCapability.STREAMING,
                    ModelCapability.TOOL_USE,
                    ModelCapability.STRUCTURED_OUTPUT,
                    ModelCapability.LONG_CONTEXT,
                }
            ),
            enterprise_ready=True,
            streaming_supported=True,
            tool_use_supported=True,
        )

    async def initialize(
        self,
    ) -> None:
        self.ensure_enabled()
        self._initialized = True

    async def close(
        self,
    ) -> None:
        self._initialized = False

    async def health_check(
        self,
    ) -> ProviderHealth:
        if not self.google_config.enabled:
            return ProviderHealth(
                healthy=False,
                provider="google",
                status=ProviderStatus.DISABLED,
                message=(
                    "Google provider is disabled."
                ),
                checked_at=time.time(),
            )

        if not self.google_config.api_key:
            return ProviderHealth(
                healthy=False,
                provider="google",
                status=ProviderStatus.UNAVAILABLE,
                message=(
                    "GOOGLE_API_KEY or "
                    "GEMINI_API_KEY is not configured."
                ),
                checked_at=time.time(),
            )

        return ProviderHealth(
            healthy=True,
            provider="google",
            status=ProviderStatus.READY,
            message=(
                "Google configuration is available."
            ),
            checked_at=time.time(),
        )

    async def list_models(
        self,
    ) -> list[ModelInfo]:
        models: list[ModelInfo] = []

        for model in GOOGLE_MODELS.values():
            capabilities = {
                ModelCapability.CHAT,
            }

            if model.supports_streaming:
                capabilities.add(
                    ModelCapability.STREAMING
                )

            if model.supports_tools:
                capabilities.add(
                    ModelCapability.TOOL_USE
                )

            if model.supports_reasoning:
                capabilities.add(
                    ModelCapability.REASONING
                )

            if model.supports_vision:
                capabilities.add(
                    ModelCapability.VISION
                )

            if model.supports_audio:
                capabilities.add(
                    ModelCapability.AUDIO
                )

            if model.supports_structured_output:
                capabilities.add(
                    ModelCapability.STRUCTURED_OUTPUT
                )

            models.append(
                ModelInfo(
                    id=model.model_id,
                    provider="google",
                    aliases=(
                        model.display_name,
                    ),
                    tier=ProviderTier.LLM,
                    capabilities=frozenset(
                        capabilities
                    ),
                    context_window=(
                        model.context_window
                    ),
                    max_output_tokens=(
                        model.max_output_tokens
                    ),
                    estimated_latency_ms=None,
                    quality_score=None,
                    enabled=True,
                    metadata={
                        "display_name": (
                            model.display_name
                        ),
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
                        "supports_audio": (
                            model.supports_audio
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

        async for chunk in (
            self.stream_adapter.stream(
                request
            )
        ):
            yield chunk


def _to_base_config(
    config: GoogleConfig,
) -> ProviderConfig:
    return ProviderConfig(
        provider_id=config.provider_id,
        api_key=config.api_key,
        base_url=config.base_url,
        timeout_seconds=config.timeout_seconds,
        max_retries=config.max_retries,
        enabled=config.enabled,
    )


__all__ = ["GoogleProvider"]
