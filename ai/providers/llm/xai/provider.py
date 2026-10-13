from __future__ import annotations

from ai.providers.base.provider import BaseProvider
from ai.providers.base.request import ChatRequest
from ai.providers.base.response import ChatResponse, StreamChunk
from ai.providers.base.models import ProviderHealth, ProviderMetadata

from .chat import XAIChat
from .client import XAIClient
from .config import XAIConfig
from .models import (
    DEFAULT_XAI_MODELS,
    get_default_models,
    model_from_remote,
)
from .stream import XAIStreamParser
from .tokenizer import XAITokenizer


class XAIProvider(BaseProvider):
    def __init__(self, config: XAIConfig | None = None):
        self.config = config or XAIConfig.from_env()
        self.client = XAIClient(self.config)
        self.chat_client = XAIChat(self.client, self.config)
        self.tokenizer = XAITokenizer(self.config.default_model)
        self._initialized = False

    @property
    def metadata(self) -> ProviderMetadata:
        return ProviderMetadata(
            provider_id="xai",
            name="xAI",
            description="xAI Grok model provider",
            website="https://x.ai",
        )

    async def initialize(self) -> None:
        self.config.validate()

        if not self.config.enabled:
            return

        await self.client.initialize()
        self._initialized = True

    async def close(self) -> None:
        await self.client.close()
        self._initialized = False

    async def health_check(self) -> ProviderHealth:
        if not self.config.enabled:
            return ProviderHealth(
                provider_id="xai",
                healthy=False,
                message="Provider disabled",
            )

        try:
            await self.client.initialize()

            return ProviderHealth(
                provider_id="xai",
                healthy=True,
                message="xAI provider is available",
            )

        except Exception as exc:
            return ProviderHealth(
                provider_id="xai",
                healthy=False,
                message=str(exc),
            )

    async def list_models(self):
        try:
            remote_models = await self.client.list_models()

            if remote_models:
                return [
                    model_from_remote(model)
                    for model in remote_models
                    if model.get("id")
                ]

        except Exception:
            pass

        return get_default_models()

    def supports_model(self, model: str) -> bool:
        if not model:
            return False

        model_lower = model.lower()

        if model_lower.startswith("grok"):
            return True

        return any(
            model_lower == item.id.lower()
            or model_lower in {
                alias.lower()
                for alias in item.aliases
            }
            for item in DEFAULT_XAI_MODELS
        )

    async def chat(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        await self.ensure_initialized()

        if not request.model:
            request = request.clone(
                model=self.config.default_model
            )

        if not self.supports_model(request.model):
            raise ValueError(
                f"Unsupported xAI model: {request.model}"
            )

        return await self.chat_client.create(request)

    async def stream(
        self,
        request: ChatRequest,
    ):
        await self.ensure_initialized()

        if not request.model:
            request = request.clone(
                model=self.config.default_model,
                stream=True,
            )

        payload = self.chat_client.build_payload(request)
        payload["stream"] = True

        parser = XAIStreamParser(
            provider="xai",
            model=request.model,
            request_id=str(request.request_id),
        )

        async for chunk in parser.parse(
            self.client.stream_request(payload)
        ):
            yield chunk
