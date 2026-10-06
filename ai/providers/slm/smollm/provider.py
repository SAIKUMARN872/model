from __future__ import annotations

from collections.abc import AsyncIterator

from ...base.models import (
    ModelInfo,
    ProviderHealth,
    ProviderMetadata,
    ProviderStatus,
)
from ...base.provider import BaseProvider
from ...base.request import ChatRequest
from ...base.response import ChatResponse, StreamChunk
from .client import SmolLMClient
from .config import SmolLMConfig
from .models import SMOLLM_MODELS


class SmolLMProvider(BaseProvider):
    name = "SmolLM"
    version = "1.0"

    def __init__(self, config: SmolLMConfig | None = None) -> None:
        self.config = config or SmolLMConfig.from_env()
        super().__init__(self.config)
        self.client = SmolLMClient(self.config)

    @property
    def metadata(self) -> ProviderMetadata:
        return ProviderMetadata(
            provider_id="smollm",
            display_name="SmolLM",
            version=self.version,
            tier_support=frozenset({"slm"}),
            capabilities=frozenset(
                {
                    "chat",
                    "reasoning",
                    "code",
                    "streaming",
                    "structured_output",
                    "json",
                }
            ),
            enterprise_ready=True,
            streaming_supported=True,
            tool_use_supported=False,
            metadata={
                "family": "SmolLM",
                "execution": "local",
                "open_model": True,
                "organization": "Hugging Face",
            },
        )

    async def initialize(self) -> None:
        self.ensure_enabled()

        if self._initialized:
            return

        self._initialized = True

    async def close(self) -> None:
        await self.client.close()
        self._initialized = False

    async def health_check(self) -> ProviderHealth:
        if not self.config.enabled:
            return ProviderHealth(
                healthy=False,
                provider="smollm",
                status=ProviderStatus.DISABLED,
                message="SmolLM provider is disabled.",
            )

        return ProviderHealth(
            healthy=True,
            provider="smollm",
            status=(
                ProviderStatus.READY
                if self._initialized
                else ProviderStatus.INITIALIZING
            ),
            message="SmolLM provider is available.",
        )

    async def list_models(self) -> list[ModelInfo]:
        return list(SMOLLM_MODELS)

    async def chat(self, request: ChatRequest) -> ChatResponse:
        self.ensure_initialized()
        return await self.client.chat(request)

    async def stream(
        self,
        request: ChatRequest,
    ) -> AsyncIterator[StreamChunk]:
        self.ensure_initialized()

        async for chunk in self.client.stream(request):
            yield chunk


__all__ = ["SmolLMProvider"]
