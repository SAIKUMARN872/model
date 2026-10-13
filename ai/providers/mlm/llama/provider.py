from __future__ import annotations

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
from ...base.response import ChatResponse

from .client import LlamaClient
from .config import LlamaConfig
from .models import DEFAULT_LLAMA_MODELS, to_model_info


class LlamaProvider(BaseProvider):
    """ModelNow Llama MLM provider."""

    name = "llama"
    version = "1.0.0"

    def __init__(
        self,
        config: ProviderConfig | None = None,
        llama_config: LlamaConfig | None = None,
    ) -> None:
        self.llama_config = llama_config or LlamaConfig.from_env()

        provider_config = (
            config
            or self.llama_config.provider_config()
        )

        super().__init__(provider_config)

        self.client = LlamaClient(
            self.config,
            self.llama_config,
        )

    @property
    def metadata(self) -> ProviderMetadata:
        return ProviderMetadata(
            provider_id="llama",
            display_name="Meta Llama",
            version=self.version,
            tier_support=frozenset(
                {ProviderTier.MLM}
            ),
            capabilities=frozenset(
                {
                    ModelCapability.CHAT,
                    ModelCapability.CODE,
                    ModelCapability.REASONING,
                    ModelCapability.STREAMING,
                    ModelCapability.STRUCTURED_OUTPUT,
                    ModelCapability.JSON,
                }
            ),
            enterprise_ready=True,
            streaming_supported=False,
            tool_use_supported=False,
            metadata={
                "runtime": "transformers",
                "model_family": "llama",
            },
        )

    async def initialize(self) -> None:
        self.ensure_enabled()
        self._initialized = True

    async def close(self) -> None:
        await self.client.close()
        self._initialized = False

    async def health_check(self) -> ProviderHealth:
        if not self.config.enabled:
            return ProviderHealth(
                healthy=False,
                provider=self.name,
                status=ProviderStatus.DISABLED,
                message="Llama provider is disabled.",
            )

        return ProviderHealth(
            healthy=True,
            provider=self.name,
            status=ProviderStatus.READY,
            message="Llama provider is available.",
        )

    async def list_models(self) -> list[ModelInfo]:
        return [
            to_model_info(model)
            for model in DEFAULT_LLAMA_MODELS
            if model.enabled
        ]

    async def chat(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        self.ensure_enabled()
        self.ensure_initialized()

        return await self.client.complete(request)

    async def stream(self, request: ChatRequest):
        raise NotImplementedError(
            "Llama streaming is not implemented yet."
        )

    async def supports_model(
        self,
        model_id: str,
    ) -> bool:
        return any(
            model.to_model_info().matches(model_id)
            for model in DEFAULT_LLAMA_MODELS
            if model.enabled
        )


__all__ = ["LlamaProvider"]
