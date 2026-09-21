@'
from __future__ import annotations

import time
from collections.abc import AsyncIterator
from typing import Any

from ai.providers.base.config import ProviderConfig
from ai.providers.base.models import (
    ModelCapability,
    ModelInfo,
    ProviderHealth,
    ProviderMetadata,
    ProviderStatus,
    ProviderTier,
)
from ai.providers.base.provider import BaseProvider
from ai.providers.base.request import ChatRequest
from ai.providers.base.response import ChatResponse, StreamChunk

from .chat import (
    build_converse_payload,
    parse_converse_response,
)
from .client import AWSBedrockClient
from .config import AWSBedrockConfig
from .models import (
    DEFAULT_BEDROCK_MODELS,
    BedrockModel,
)
from .stream import (
    build_stream_payload,
    parse_bedrock_event,
)


class AWSBedrockProvider(BaseProvider):
    """
    ModelNow provider adapter for Amazon Bedrock.

    Responsibilities:
    - expose Bedrock models to ModelNow
    - normalize ModelNow requests
    - execute Converse requests
    - execute ConverseStream requests
    - normalize responses
    - expose provider health and metadata
    """

    name = "aws_bedrock"
    version = "1.0.0"

    def __init__(
        self,
        config: ProviderConfig,
        *,
        bedrock_config: AWSBedrockConfig | None = None,
        models: tuple[BedrockModel, ...] | list[BedrockModel] | None = None,
    ) -> None:
        super().__init__(config)

        self.bedrock_config = (
            bedrock_config
            if bedrock_config is not None
            else AWSBedrockConfig.from_env()
        )

        self.models = tuple(
            models
            if models is not None
            else DEFAULT_BEDROCK_MODELS
        )

        self.client = AWSBedrockClient(
            config,
            bedrock_config=self.bedrock_config,
        )

    @property
    def metadata(self) -> ProviderMetadata:
        return ProviderMetadata(
            provider_id=self.config.provider_id,
            display_name="AWS Bedrock",
            version=self.version,
            tier_support=frozenset(
                {
                    ProviderTier.SLM,
                    ProviderTier.MLM,
                    ProviderTier.LLM,
                }
            ),
            capabilities=frozenset(
                {
                    ModelCapability.CHAT,
                    ModelCapability.STREAMING,
                    ModelCapability.TOOL_USE,
                    ModelCapability.STRUCTURED_OUTPUT,
                }
            ),
            enterprise_ready=True,
            streaming_supported=True,
            tool_use_supported=True,
            metadata={
                "provider_family": "aws",
                "service": "amazon-bedrock",
                "transport": "boto3",
            },
        )

    async def initialize(self) -> None:
        """
        Initialize the underlying Bedrock client.
        """

        if self.initialized:
            return

        await self.client.initialize()

        self._initialized = True

    async def close(self) -> None:
        """
        Close the underlying Bedrock client.
        """

        if not self.initialized:
            return

        await self.client.close()

        self._initialized = False

    async def health_check(self) -> ProviderHealth:
        """
        Check Bedrock provider health.

        This method intentionally avoids making a model inference
        request. It verifies that the provider client is initialized
        and available.
        """

        started = time.perf_counter()

        try:
            if not self.config.enabled:
                return ProviderHealth(
                    healthy=False,
                    provider=self.name,
                    status=ProviderStatus.DISABLED,
                    latency_ms=0.0,
                    message="AWS Bedrock provider is disabled.",
                    metadata={
                        "region": self.bedrock_config.region_name,
                    },
                )

            if not self.initialized:
                return ProviderHealth(
                    healthy=False,
                    provider=self.name,
                    status=ProviderStatus.UNAVAILABLE,
                    latency_ms=(
                        time.perf_counter() - started
                    ) * 1000,
                    message="AWS Bedrock provider is not initialized.",
                    metadata={
                        "region": self.bedrock_config.region_name,
                    },
                )

            client_ready = getattr(
                self.client,
                "client",
                None,
            ) is not None

            latency_ms = (
                time.perf_counter() - started
            ) * 1000

            if not client_ready:
                return ProviderHealth(
                    healthy=False,
                    provider=self.name,
                    status=ProviderStatus.DEGRADED,
                    latency_ms=latency_ms,
                    message="Bedrock runtime client is unavailable.",
                    metadata={
                        "region": self.bedrock_config.region_name,
                    },
                )

            return ProviderHealth(
                healthy=True,
                provider=self.name,
                status=ProviderStatus.READY,
                latency_ms=latency_ms,
                message="AWS Bedrock provider is ready.",
                metadata={
                    "region": self.bedrock_config.region_name,
                    "model_count": len(self.models),
                },
            )

        except Exception as exc:
            latency_ms = (
                time.perf_counter() - started
            ) * 1000

            return ProviderHealth(
                healthy=False,
                provider=self.name,
                status=ProviderStatus.UNAVAILABLE,
                latency_ms=latency_ms,
                message=str(exc),
                metadata={
                    "region": self.bedrock_config.region_name,
                    "error_type": type(exc).__name__,
                },
            )

    async def list_models(self) -> list[ModelInfo]:
        """
        Return normalized ModelNow model metadata.
        """

        return [
            ModelInfo(
                id=model.model_id,
                provider=self.name,
                aliases=(),
                tier=model.tier,
                capabilities=model.capabilities,
                context_window=model.context_window,
                max_output_tokens=model.max_output_tokens,
                input_cost_per_1m_tokens=(
                    model.input_cost_per_1k_tokens * 1000
                ),
                output_cost_per_1m_tokens=(
                    model.output_cost_per_1k_tokens * 1000
                ),
                estimated_latency_ms=model.latency_ms,
                quality_score=model.quality_score,
                enabled=model.enabled,
                metadata={
                    "display_name": model.display_name,
                    "provider_family": model.provider_family,
                    "bedrock_model_id": model.model_id,
                },
            )
            for model in self.models
        ]

    async def supports_model(
        self,
        model_id: str,
    ) -> bool:
        """
        Check whether this adapter supports a Bedrock model.
        """

        normalized = model_id.strip().lower()

        return any(
            model.model_id.lower() == normalized
            for model in self.models
        )

    def _get_model(
        self,
        model_id: str,
    ) -> BedrockModel:
        """
        Resolve a configured Bedrock model.
        """

        normalized = model_id.strip().lower()

        for model in self.models:
            if model.model_id.lower() == normalized:
                return model

        raise ValueError(
            f"Unsupported AWS Bedrock model: {model_id}"
        )

    async def chat(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        """
        Execute a non-streaming Bedrock Converse request.
        """

        self.ensure_enabled()
        await self.ensure_initialized()

        self._get_model(request.model)

        payload = build_converse_payload(request)

        started = time.perf_counter()

        response = await self.client.converse(
            payload
        )

        result = parse_converse_response(
            response,
            provider=self.name,
            request_id=str(request.request_id),
        )

        result.model = request.model
        result.latency_ms = (
            time.perf_counter() - started
        ) * 1000

        result.metadata.update(
            {
                "region": self.bedrock_config.region_name,
                "provider_version": self.version,
            }
        )

        return result

    async def stream(
        self,
        request: ChatRequest,
    ) -> AsyncIterator[StreamChunk]:
        """
        Execute a Bedrock ConverseStream request.
        """

        self.ensure_enabled()
        await self.ensure_initialized()

        self._get_model(request.model)

        payload = build_stream_payload(request)

        request_id = str(request.request_id)

        async for event in self.client.converse_stream(
            payload
        ):
            chunk = parse_bedrock_event(
                event,
                provider=self.name,
                model=request.model,
                request_id=request_id,
            )

            yield chunk


__all__ = [
    "AWSBedrockProvider",
]
'@ | Set-Content ".\ai\providers\llm\aws_bedrock\provider.py"