from __future__ import annotations

from typing import AsyncIterator

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

from .client import GemmaClient
from .config import GemmaConfig
from .models import GEMMA_MODELS


class GemmaProvider(BaseProvider):
    """ModelNow local SLM provider for Google Gemma."""

    def __init__(
        self,
        config: GemmaConfig | None = None,
    ) -> None:
        self.config = config or GemmaConfig()
        self.client = GemmaClient(self.config)

        self._initialized = False
        self._status = ProviderStatus.UNKNOWN

    async def initialize(self) -> None:
        if not self.config.enabled:
            self._status = ProviderStatus.DISABLED
            return

        self._initialized = True
        self._status = ProviderStatus.READY

    async def close(self) -> None:
        await self.client.close()

        self._initialized = False
        self._status = ProviderStatus.CLOSED

    async def health_check(
        self,
    ) -> ProviderHealth:
        if not self._initialized:
            return ProviderHealth(
                healthy=False,
                provider="gemma",
                status=ProviderStatus.UNAVAILABLE,
                latency_ms=None,
                message=(
                    "Gemma provider "
                    "is not initialized."
                ),
            )

        return ProviderHealth(
            healthy=True,
            provider="gemma",
            status=ProviderStatus.READY,
            latency_ms=0.0,
            message=(
                "Gemma SLM provider is ready."
            ),
            metadata={
                "execution": "local",
                "model_loaded": self.client.loaded,
            },
        )

    async def list_models(
        self,
    ) -> list[ModelInfo]:
        return list(GEMMA_MODELS)

    async def supports_model(
        self,
        model_id: str,
    ) -> bool:
        value = model_id.lower()

        for model in GEMMA_MODELS:
            if model.id.lower() == value:
                return True

            if any(
                alias.lower() == value
                for alias in model.aliases
            ):
                return True

        return False

    async def chat(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        await self.ensure_initialized()

        if not await self.supports_model(
            request.model
        ):
            raise ValueError(
                f"Unsupported Gemma model: "
                f"{request.model}"
            )

        return await self.client.chat(request)

    async def stream(
        self,
        request: ChatRequest,
    ) -> AsyncIterator[StreamChunk]:
        await self.ensure_initialized()

        if not await self.supports_model(
            request.model
        ):
            raise ValueError(
                f"Unsupported Gemma model: "
                f"{request.model}"
            )

        async for chunk in self.client.stream(
            request
        ):
            yield chunk

    def metadata(self) -> ProviderMetadata:
        return ProviderMetadata(
            provider_id="gemma",
            display_name="Google Gemma",
            version="1.0.0",
            tier_support=(ProviderTier.SLM,),
            capabilities=(
                ModelCapability.CHAT,
                ModelCapability.REASONING,
                ModelCapability.CODE,
                ModelCapability.STREAMING,
                ModelCapability.LONG_CONTEXT,
                ModelCapability.STRUCTURED_OUTPUT,
                ModelCapability.JSON,
            ),
            enterprise_ready=True,
            streaming_supported=True,
            tool_use_supported=False,
            metadata={
                "family": "Gemma",
                "execution": "local",
                "open_model": True,
            },
        )