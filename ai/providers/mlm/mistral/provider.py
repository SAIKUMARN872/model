from __future__ import annotations

from ai.providers.base.config import ProviderConfig
from ai.providers.base.models import (
    ModelInfo,
    ProviderHealth,
    ProviderMetadata,
    ProviderStatus,
    ProviderTier,
)
from ai.providers.base.provider import BaseProvider
from ai.providers.base.request import ChatRequest
from ai.providers.base.response import ChatResponse

from .chat import MistralChat
from .client import MistralClient
from .config import MistralConfig
from .models import DEFAULT_MISTRAL_MODELS, to_model_info
from .stream import MistralStream


class MistralProvider(BaseProvider):
    def __init__(
        self,
        config: ProviderConfig | None = None,
        mistral_config: MistralConfig | None = None,
    ) -> None:
        self.mistral_config = mistral_config or MistralConfig.from_env()
        self.config = config or self.mistral_config.provider_config()
        self.client = MistralClient(self.config, self.mistral_config)
        self.chat_client = MistralChat(self.client)
        self.stream_client = MistralStream(self.client)
        self._initialized = False

    @property
    def name(self) -> str:
        return "mistral"

    @property
    def version(self) -> str:
        return "2.10.1"

    @property
    def metadata(self) -> ProviderMetadata:
        return ProviderMetadata(
            provider_id="mistral",
            display_name="Mistral",
            version=self.version,
            tier_support=(ProviderTier.MLM,),
            capabilities=(),
            enterprise_ready=True,
            streaming_supported=True,
            tool_use_supported=True,
            metadata={"sdk": "mistralai"},
        )

    async def initialize(self) -> None:
        self.ensure_enabled()
        self._initialized = True

    async def close(self) -> None:
        await self.client.close()
        self._initialized = False

    async def health_check(self) -> ProviderHealth:
        if not self.config.api_key:
            return ProviderHealth(
                healthy=False,
                provider="mistral",
                status=ProviderStatus.UNAVAILABLE,
                message="MISTRAL_API_KEY is not configured.",
            )

        return ProviderHealth(
            healthy=True,
            provider="mistral",
            status=ProviderStatus.READY,
            message="Mistral provider is configured.",
        )

    async def list_models(self) -> list[ModelInfo]:
        return [
            to_model_info(model)
            for model in DEFAULT_MISTRAL_MODELS
            if model.enabled
        ]

    async def chat(self, request: ChatRequest) -> ChatResponse:
        self.ensure_enabled()
        self.ensure_initialized()
        return await self.chat_client.complete(request)

    async def stream(self, request: ChatRequest):
        self.ensure_enabled()
        self.ensure_initialized()
        async for chunk in self.stream_client.stream(request):
            yield chunk

    def supports_model(self, model_name: str) -> bool:
        value = model_name.strip().lower()
        return any(
            value == model.model_id.lower()
            for model in DEFAULT_MISTRAL_MODELS
        )
