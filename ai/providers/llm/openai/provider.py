from __future__ import annotations

from typing import AsyncIterator

from ...base.models import (
    ModelInfo,
    ProviderHealth,
)
from ...base.provider import BaseProvider
from ...base.request import ChatRequest
from ...base.response import (
    ChatResponse,
    StreamChunk,
)
from ...base.config import ProviderConfig

from .chat import OpenAIChat
from .client import OpenAIClient
from .config import OpenAIConfig
from .models import DEFAULT_OPENAI_MODELS
from .stream import OpenAIStream


class OpenAIProvider(BaseProvider):
    """ModelNow OpenAI provider implementation."""

    PROVIDER_ID = "openai"
    DISPLAY_NAME = "OpenAI"
    VERSION = "1.0.0"

    @property
    def name(self) -> str:
        return self.DISPLAY_NAME

    @property
    def version(self) -> str:
        return self.VERSION

    def __init__(
        self,
        config: ProviderConfig,
        openai_config: OpenAIConfig | None = None,
    ) -> None:
        super().__init__(config)

        self.openai_config = (
            openai_config
            or OpenAIConfig.from_env()
        )

        self.client = OpenAIClient(
            config=config,
            openai_config=self.openai_config,
        )

        self.chat_client = OpenAIChat(self.client)
        self.stream_client = OpenAIStream(self.client)

    async def initialize(self) -> None:
        if self._initialized:
            return

        self._initialized = True

    async def close(self) -> None:
        if not self._initialized:
            return

        await self.client.close()
        self._initialized = False

    async def health_check(self) -> ProviderHealth:
        import time

        started = time.perf_counter()

        try:
            if not self.openai_config.api_key:
                return ProviderHealth(
                    healthy=False,
                    provider=self.PROVIDER_ID,
                    status="unavailable",
                    latency_ms=(
                        time.perf_counter() - started
                    ) * 1000.0,
                    message=(
                        "OpenAI API key is not configured."
                    ),
                )

            return ProviderHealth(
                healthy=True,
                provider=self.PROVIDER_ID,
                status="ready",
                latency_ms=(
                    time.perf_counter() - started
                ) * 1000.0,
                message="OpenAI provider is configured.",
            )

        except Exception as exc:
            return ProviderHealth(
                healthy=False,
                provider=self.PROVIDER_ID,
                status="unavailable",
                latency_ms=(
                    time.perf_counter() - started
                ) * 1000.0,
                message=str(exc),
            )

    async def list_models(self) -> list[ModelInfo]:
        return [
            ModelInfo(
                id=model.model_id,
                provider=self.PROVIDER_ID,
                aliases=model.aliases,
                tier=model.tier,
                capabilities=model.capabilities,
                context_window=model.context_window,
                max_output_tokens=model.max_output_tokens,
                input_cost_per_1m_tokens=(
                    model.input_cost_per_1k_tokens * 1000
                ),
                output_cost_per_1m_tokens=(
                    model.output_cost_per_1k_tokens * 1000
                ),
                estimated_latency_ms=model.latency_ms,
                quality_score=model.quality_score,
                enabled=model.enabled,
                metadata=model.model_info,
            )
            for model in DEFAULT_OPENAI_MODELS
        ]

    async def chat(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        self.ensure_enabled()
        self.ensure_initialized()

        return await self.chat_client.create(request)

    async def stream(
        self,
        request: ChatRequest,
    ) -> AsyncIterator[StreamChunk]:
        self.ensure_enabled()
        self.ensure_initialized()

        async for chunk in self.stream_client.stream(
            request
        ):
            yield chunk


__all__ = ["OpenAIProvider"]


