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
from .client import LlamaClient
from .config import LlamaConfig
from .models import LLAMA_MODELS


class LlamaProvider(BaseProvider):
    """Llama local SLM provider."""

    name = "Meta Llama"
    version = "1.0"

    def __init__(self, config: LlamaConfig | None = None) -> None:
        self.config = config or LlamaConfig.from_env()
        self.client = LlamaClient(self.config)
        super().__init__(self.config)

    @property
    def metadata(self) -> ProviderMetadata:
        return ProviderMetadata(
            provider_id="llama",
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
                "family": "Llama",
                "execution": "local",
                "organization": "Meta",
                "open_model": True,
            },
        )

    async def initialize(self) -> None:
        self.ensure_enabled()

        if self._initialized:
            return

        # Initialization intentionally does not load model weights.
        # The model is loaded lazily on the first chat request.
        self._initialized = True

    async def close(self) -> None:
        await self.client.close()
        self._initialized = False

    async def health_check(self) -> ProviderHealth:
        if not self.config.enabled:
            return ProviderHealth(
                healthy=False,
                provider="llama",
                status=ProviderStatus.DISABLED,
                message="Llama SLM provider is disabled.",
            )

        if not self._initialized:
            return ProviderHealth(
                healthy=False,
                provider="llama",
                status=ProviderStatus.UNKNOWN,
                message="Llama SLM provider is not initialized.",
            )

        return ProviderHealth(
            healthy=True,
            provider="llama",
            status=ProviderStatus.READY,
            message="Llama SLM provider is ready.",
        )

    async def list_models(self) -> list[ModelInfo]:
        return list(LLAMA_MODELS)

    async def chat(self, request: ChatRequest) -> ChatResponse:
        self.ensure_initialized()
        self.ensure_enabled()

        if not await self.supports_model(request.model):
            raise ValueError(
                f"Unsupported Llama model: {request.model}"
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
                f"Unsupported Llama model: {request.model}"
            )

        async for chunk in self.client.stream(request):
            yield chunk


__all__ = ["LlamaProvider"]
