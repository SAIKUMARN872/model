from __future__ import annotations

from ...base.models import (
    ModelInfo,
    ProviderHealth,
    ProviderMetadata,
    ProviderStatus,
)
from ...base.provider import BaseProvider
from ...base.request import ChatRequest
from ...base.response import ChatResponse
from .client import PhiClient
from .config import PhiConfig
from .models import PHI_MODELS


class PhiProvider(BaseProvider):
    """Microsoft Phi local SLM provider."""

    name = "Microsoft Phi"
    version = "1.0"

    def __init__(self, config: PhiConfig | None = None) -> None:
        self.config = config or PhiConfig.from_env()
        self.client = PhiClient(self.config)

        super().__init__(self.config)

    @property
    def metadata(self) -> ProviderMetadata:
        return ProviderMetadata(
            provider_id="phi",
            display_name=self.name,
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
                "family": "Phi",
                "execution": "local",
                "organization": "Microsoft",
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
                provider="phi",
                status=ProviderStatus.DISABLED,
                message="Phi SLM provider is disabled.",
            )

        if not self._initialized:
            return ProviderHealth(
                healthy=False,
                provider="phi",
                status=ProviderStatus.UNKNOWN,
                message="Phi SLM provider is not initialized.",
            )

        return ProviderHealth(
            healthy=True,
            provider="phi",
            status=ProviderStatus.READY,
            message="Phi SLM provider is ready.",
        )

    async def list_models(self) -> list[ModelInfo]:
        return list(PHI_MODELS)

    async def chat(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        self.ensure_initialized()
        self.ensure_enabled()

        if not await self.supports_model(request.model):
            raise ValueError(
                f"Unsupported Phi model: {request.model}"
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
                f"Unsupported Phi model: {request.model}"
            )

        async for chunk in self.client.stream(request):
            yield chunk


__all__ = ["PhiProvider"]
