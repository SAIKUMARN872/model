from __future__ import annotations

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
from .client import TinyLlamaClient
from .config import TinyLlamaConfig
from .models import TINYLLAMA_MODELS


class TinyLlamaProvider(BaseProvider):
    name = "TinyLlama"
    version = "1.0"

    def __init__(
        self,
        config: TinyLlamaConfig | None = None,
    ) -> None:
        self.config = config or TinyLlamaConfig.from_env()
        self.client = TinyLlamaClient(self.config)

        super().__init__(self.config)

    @property
    def metadata(self) -> ProviderMetadata:
        return ProviderMetadata(
            provider_id="tinyllama",
            display_name="TinyLlama",
            version=self.version,
            tier_support=frozenset(
                {ProviderTier.SLM}
            ),
            capabilities=frozenset(
                {
                    ModelCapability.CHAT,
                    ModelCapability.REASONING,
                    ModelCapability.CODE,
                    ModelCapability.STREAMING,
                    ModelCapability.STRUCTURED_OUTPUT,
                    ModelCapability.JSON,
                }
            ),
            enterprise_ready=True,
            streaming_supported=True,
            tool_use_supported=False,
            metadata={
                "family": "TinyLlama",
                "local": True,
                "open_model": True,
                "organization": "TinyLlama",
            },
        )

    async def initialize(self) -> None:
        self.ensure_enabled()

        if self._initialized:
            return

        self._initialized = True

    async def close(self) -> None:
        if not self._initialized:
            return

        await self.client.close()
        self._initialized = False

    async def health_check(self) -> ProviderHealth:
        if not self.config.enabled:
            return ProviderHealth(
                healthy=False,
                provider="tinyllama",
                status=ProviderStatus.DISABLED,
                message="Provider is disabled.",
            )

        if not self._initialized:
            return ProviderHealth(
                healthy=False,
                provider="tinyllama",
                status=ProviderStatus.UNAVAILABLE,
                message="Provider is not initialized.",
            )

        return ProviderHealth(
            healthy=True,
            provider="tinyllama",
            status=ProviderStatus.READY,
            message="TinyLlama provider is ready.",
        )

    async def list_models(self) -> list[ModelInfo]:
        return list(TINYLLAMA_MODELS)

    async def chat(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        self.ensure_initialized()
        self.ensure_enabled()

        return await self.client.chat(request)

    async def stream(
        self,
        request: ChatRequest,
    ) -> AsyncIterator[StreamChunk]:
        self.ensure_initialized()
        self.ensure_enabled()

        async for chunk in self.client.stream(request):
            yield chunk


__all__ = ["TinyLlamaProvider"]
