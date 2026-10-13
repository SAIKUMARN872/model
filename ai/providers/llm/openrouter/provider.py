from __future__ import annotations

from typing import AsyncIterator

from ai.providers.base.provider import BaseProvider
from ai.providers.base.request import ChatRequest
from ai.providers.base.response import (
    ChatResponse,
    StreamChunk,
)

from .chat import OpenRouterChat
from .client import OpenRouterClient
from .config import OpenRouterConfig
from .models import (
    DEFAULT_OPENROUTER_MODELS,
    OpenRouterModel,
)
from .stream import OpenRouterStreamParser
from .utils import parse_model


class OpenRouterProvider(BaseProvider):
    def __init__(
        self,
        config: OpenRouterConfig | None = None,
    ) -> None:
        self.openrouter_config = (
            config or OpenRouterConfig.from_env()
        )

        super().__init__(self.openrouter_config)

        self.client = OpenRouterClient(
            self.openrouter_config
        )

        self.chat_client = OpenRouterChat(
            self.client
        )

        self._models: list[OpenRouterModel] = [
            *DEFAULT_OPENROUTER_MODELS
        ]

    @property
    def name(self) -> str:
        return "openrouter"

    @property
    def metadata(self):
        return {
            "provider": "openrouter",
            "endpoint": self.openrouter_config.base_url,
            "model_count": len(self._models),
        }

    async def initialize(self) -> None:
        if not self.openrouter_config.enabled:
            self._initialized = False
            return

        self._initialized = True

    async def close(self) -> None:
        self._initialized = False

    async def health_check(self):
        from ai.providers.base.models import ProviderHealth

        if not self.openrouter_config.enabled:
            return ProviderHealth(
                provider="openrouter",
                status="disabled",
                message="OpenRouter provider is disabled.",
            )

        if not self.openrouter_config.api_key:
            return ProviderHealth(
                provider="openrouter",
                status="unknown",
                message=(
                    "OPENROUTER_API_KEY is not configured."
                ),
            )

        try:
            await self.client.list_models()

            return ProviderHealth(
                provider="openrouter",
                status="ready",
                message="OpenRouter API is reachable.",
            )

        except Exception as exc:
            return ProviderHealth(
                provider="openrouter",
                status="unavailable",
                message=str(exc),
            )

    async def list_models(
        self,
    ) -> list:
        if not self.openrouter_config.api_key:
            return [
                model.to_model_info()
                for model in self._models
            ]

        try:
            data = await self.client.list_models()

            remote_models = data.get("data") or []

            parsed = [
                parse_model(item)
                for item in remote_models
                if item.get("id")
            ]

            if parsed:
                self._models = parsed

        except Exception:
            pass

        return [
            model.to_model_info()
            for model in self._models
        ]

    async def supports_model(
        self,
        model: str,
    ) -> bool:
        return any(
            item.id == model
            for item in self._models
        )

    async def chat(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        if not self.openrouter_config.enabled:
            raise RuntimeError(
                "OpenRouter provider is disabled."
            )

        if not self.openrouter_config.api_key:
            raise RuntimeError(
                "OPENROUTER_API_KEY is not configured."
            )

        if not await self.supports_model(request.model):
            if "/" not in request.model:
                raise ValueError(
                    f"Unsupported OpenRouter model: "
                    f"{request.model}"
                )

        await self.ensure_initialized()

        return await self.chat_client.complete(request)

    async def stream(
        self,
        request: ChatRequest,
    ) -> AsyncIterator[StreamChunk]:
        if not self.openrouter_config.enabled:
            raise RuntimeError(
                "OpenRouter provider is disabled."
            )

        if not self.openrouter_config.api_key:
            raise RuntimeError(
                "OPENROUTER_API_KEY is not configured."
            )

        await self.ensure_initialized()

        from .utils import request_to_payload

        payload = request_to_payload(request)
        payload["stream"] = True

        parser = OpenRouterStreamParser(
            request.model,
            str(request.request_id),
        )

        async for line in self.client.stream(payload):
            chunk = parser.parse_line(line)

            if chunk is not None:
                yield chunk

                if chunk.done:
                    break
