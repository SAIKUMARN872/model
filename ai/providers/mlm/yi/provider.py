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

from .client import YiClient
from .config import YiConfig
from .models import DEFAULT_YI_MODELS, to_model_info


class YiProvider(BaseProvider):
    """ModelNow Yi MLM provider."""

    name = "yi"
    version = "1.0.0"

    def __init__(
        self,
        config: ProviderConfig | None = None,
        yi_config: YiConfig | None = None,
    ) -> None:
        self.yi_config = yi_config or YiConfig.from_env()

        provider_config = (
            config
            or self.yi_config.provider_config()
        )

        super().__init__(provider_config)

        self.client = YiClient(
            self.config,
            self.yi_config,
        )

    @property
    def metadata(self) -> ProviderMetadata:
        return ProviderMetadata(
            provider_id="yi",
            display_name="01.AI Yi",
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
                "model_family": "yi",
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
                message="Yi provider is disabled.",
            )

        return ProviderHealth(
            healthy=True,
            provider=self.name,
            status=ProviderStatus.READY,
            message="Yi provider is available.",
        )

    async def list_models(self) -> list[ModelInfo]:
        return [
            to_model_info(model)
            for model in DEFAULT_YI_MODELS
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
            "Yi streaming is not implemented yet."
        )

    async def supports_model(
        self,
        model_id: str,
    ) -> bool:
        return any(
            model.to_model_info().matches(model_id)
            for model in DEFAULT_YI_MODELS
            if model.enabled
        )


__all__ = ["YiProvider"]
