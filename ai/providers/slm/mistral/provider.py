from __future__ import annotations

from ...base.models import (
    ModelInfo,
    ProviderHealth,
    ProviderMetadata,
    ProviderStatus,
)
from ...base.provider import BaseProvider
from ...base.request import ChatRequest
from ...base.response import ChatResponse, StreamChunk
from .client import MistralClient
from .config import MistralConfig
from .models import MISTRAL_MODELS


class MistralProvider(BaseProvider):
    """Mistral local SLM provider."""

    name = "Mistral AI"
    version = "1.0"

    def __init__(
        self,
        config: MistralConfig | None = None,
    ) -> None:
        self.config = config or MistralConfig.from_env()
        self.client = MistralClient(self.config)

        super().__init__(self.config)

    @property
    def metadata(self) -> ProviderMetadata:
        return ProviderMetadata(
            provider_id="mistral",
            display_name=self.name,
            version=self.version,
            tier_support=frozenset({"slm"}),
            capabilities=frozenset(
                {
                    "chat",
                    "reasoning",
                    "code",
                    "streaming",
                    "long_context",
                    "structured_output",
                    "json",
                }
            ),
            enterprise_ready=True,
            streaming_supported=True,
            tool_use_supported=False,
            metadata={
                "family": "Mistral",
                "execution": "local",
                "organization": "Mistral AI",
                "open_model": True,
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
                provider="mistral",
                status=ProviderStatus.DISABLED,
                message="Mistral SLM provider is disabled.",
            )

        if not self._initialized:
            return ProviderHealth(
                healthy=False,
                provider="mistral",
                status=ProviderStatus.UNKNOWN,
                message="Mistral SLM provider is not initialized.",
            )

        return ProviderHealth(
            healthy=True,
            provider="mistral",
            status=ProviderStatus.READY,
            message="Mistral SLM provider is ready.",
        )

    async def list_models(self) -> list[ModelInfo]:
        return list(MISTRAL_MODELS)

    async def chat(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        self.ensure_initialized()
        self.ensure_enabled()

        if not await self.supports_model(request.model):
            raise ValueError(
                f"Unsupported Mistral model: {request.model}"
            )

        return await self.client.chat(request)

    async def stream(
        self,
        request: ChatRequest,
    ):
        self.ensure_initialized()
        self.ensure_enabled()

        if not await self.supports_model(request.model):
            raise ValueError(
                f"Unsupported Mistral model: {request.model}"
            )

        async for chunk in self.client.stream(request):
            yield chunk


__all__ = ["MistralProvider"]
