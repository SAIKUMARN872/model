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
from .client import QwenClient
from .config import QwenConfig
from .models import QWEN_MODELS


class QwenProvider(BaseProvider):
    """Alibaba Qwen local SLM provider."""

    name = "Qwen"
    version = "1.0"

    def __init__(
        self,
        config: QwenConfig | None = None,
    ) -> None:
        self.config = config or QwenConfig.from_env()
        self.client = QwenClient(self.config)

        super().__init__(self.config)

    @property
    def metadata(self) -> ProviderMetadata:
        return ProviderMetadata(
            provider_id="qwen",
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
                "family": "Qwen",
                "execution": "local",
                "organization": "Alibaba Cloud",
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
                provider="qwen",
                status=ProviderStatus.DISABLED,
                message="Qwen SLM provider is disabled.",
            )

        if not self._initialized:
            return ProviderHealth(
                healthy=False,
                provider="qwen",
                status=ProviderStatus.UNKNOWN,
                message="Qwen SLM provider is not initialized.",
            )

        return ProviderHealth(
            healthy=True,
            provider="qwen",
            status=ProviderStatus.READY,
            message="Qwen SLM provider is ready.",
        )

    async def list_models(self) -> list[ModelInfo]:
        return list(QWEN_MODELS)

    async def chat(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        self.ensure_initialized()
        self.ensure_enabled()

        if not await self.supports_model(
            request.model
        ):
            raise ValueError(
                f"Unsupported Qwen model: "
                f"{request.model}"
            )

        return await self.client.chat(request)

    async def stream(
        self,
        request: ChatRequest,
    ):
        self.ensure_initialized()
        self.ensure_enabled()

        if not await self.supports_model(
            request.model
        ):
            raise ValueError(
                f"Unsupported Qwen model: "
                f"{request.model}"
            )

        async for chunk in self.client.stream(
            request
        ):
            yield chunk


__all__ = ["QwenProvider"]
