from __future__ import annotations

from collections.abc import AsyncIterator

from ...base.config import ProviderConfig
from ...base.models import (
    ModelCapability,
    ModelInfo,
    ProviderHealth,
    ProviderStatus,
    ProviderTier,
)
from ...base.provider import BaseProvider
from ...base.request import ChatRequest
from ...base.response import ChatResponse, StreamChunk

from .chat import CohereChat
from .client import CohereClient
from .config import CohereConfig
from .models import COHERE_MODELS
from .stream import CohereStream


class CohereProvider(BaseProvider):
    """ModelNow Cohere provider implementation."""

    PROVIDER_ID = "cohere"
    DISPLAY_NAME = "Cohere"
    VERSION = "1.0.0"

    @property
    def name(self) -> str:
        return self.DISPLAY_NAME

    @property
    def version(self) -> str:
        return self.VERSION

    def __init__(
        self,
        config: ProviderConfig,
        cohere_config: CohereConfig | None = None,
    ) -> None:
        super().__init__(config)

        self.cohere_config = (
            cohere_config
            or CohereConfig.from_env()
        )

        self.client = CohereClient(
            self.cohere_config
        )

        self.chat_client = CohereChat(
            self.client
        )

        self.stream_client = CohereStream(
            self.client
        )

    async def initialize(self) -> None:
        if self._initialized:
            return

        self._initialized = True

    async def close(self) -> None:
        if not self._initialized:
            return

        self._initialized = False

    async def health_check(
        self,
    ) -> ProviderHealth:
        import time

        started = time.perf_counter()

        try:
            if not self.cohere_config.api_key:
                return ProviderHealth(
                    healthy=False,
                    provider=self.PROVIDER_ID,
                    status=ProviderStatus.UNAVAILABLE,
                    latency_ms=(
                        time.perf_counter()
                        - started
                    ) * 1000.0,
                    message=(
                        "Cohere API key is not configured."
                    ),
                )

            return ProviderHealth(
                healthy=True,
                provider=self.PROVIDER_ID,
                status=ProviderStatus.READY,
                latency_ms=(
                    time.perf_counter()
                    - started
                ) * 1000.0,
                message=(
                    "Cohere provider is configured."
                ),
            )

        except Exception as exc:
            return ProviderHealth(
                healthy=False,
                provider=self.PROVIDER_ID,
                status=ProviderStatus.UNAVAILABLE,
                latency_ms=(
                    time.perf_counter()
                    - started
                ) * 1000.0,
                message=str(exc),
            )

    async def list_models(
        self,
    ) -> list[ModelInfo]:
        result: list[ModelInfo] = []

        for model in COHERE_MODELS.values():
            capabilities = {
                ModelCapability.CHAT,
            }

            if model.supports_streaming:
                capabilities.add(ModelCapability.STREAMING)

            if model.supports_tools:
                capabilities.add(ModelCapability.TOOL_USE)

            if model.supports_reasoning:
                capabilities.add(ModelCapability.REASONING)

            if model.supports_vision:
                capabilities.add(ModelCapability.VISION)

            if model.supports_citations:
                capabilities.add(ModelCapability.RAG)

            if model.supports_structured_output:
                capabilities.add(
                    ModelCapability.STRUCTURED_OUTPUT
                )

            if model.tier.lower() == "slm":
                tier = ProviderTier.SLM
            elif model.tier.lower() == "mlm":
                tier = ProviderTier.MLM
            else:
                tier = ProviderTier.LLM

            aliases = (
                model.model_id.split("-")[0],
                model.display_name.lower().replace(" ", "-"),
            )

            result.append(
                ModelInfo(
                    id=model.model_id,
                    provider=self.PROVIDER_ID,
                    aliases=tuple(
                        dict.fromkeys(aliases)
                    ),
                    tier=tier,
                    capabilities=frozenset(
                        capabilities
                    ),
                    context_window=model.context_window,
                    max_output_tokens=model.max_output_tokens,
                    enabled=True,
                    metadata={
                        "display_name": model.display_name,
                        "supports_streaming": (
                            model.supports_streaming
                        ),
                        "supports_tools": (
                            model.supports_tools
                        ),
                        "supports_reasoning": (
                            model.supports_reasoning
                        ),
                        "supports_vision": (
                            model.supports_vision
                        ),
                        "supports_citations": (
                            model.supports_citations
                        ),
                        "supports_structured_output": (
                            model.supports_structured_output
                        ),
                    },
                )
            )

        return result

    async def chat(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        self.ensure_enabled()
        self.ensure_initialized()

        return await self.chat_client.create(
            request
        )

    async def stream(
        self,
        request: ChatRequest,
    ) -> AsyncIterator[StreamChunk]:
        self.ensure_enabled()
        self.ensure_initialized()

        async for chunk in self.stream_client.stream(
            request
        ):
            yield chunk


__all__ = ["CohereProvider"]
