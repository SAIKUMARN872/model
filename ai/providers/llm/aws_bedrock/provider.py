from __future__ import annotations

from typing import AsyncIterator

from ai.providers.base.config import ProviderConfig
from ai.providers.base.provider import BaseProvider
from ai.providers.base.request import ChatRequest
from ai.providers.base.response import (
    ChatResponse,
    StreamChunk,
)
from ai.providers.base.models import (
    ProviderHealth,
    ProviderMetadata,
)

from .chat import AWSBedrockChat
from .client import AWSBedrockClient
from .config import AWSBedrockConfig
from .models import (
    AWSBedrockModel,
    DEFAULT_AWS_BEDROCK_MODELS,
)
from .stream import AWSBedrockStreamParser
from .tokenizer import AWSBedrockTokenizer
from .utils import (
    parse_model_summary,
    request_to_converse_payload,
)


class AWSBedrockProvider(BaseProvider):
    name = "aws_bedrock"

    def __init__(
        self,
        config: ProviderConfig | AWSBedrockConfig | None = None,
    ) -> None:
        if config is None:
            provider_config = ProviderConfig(
                provider_id="aws_bedrock"
            )
            bedrock_config = (
                AWSBedrockConfig.from_provider_config(
                    provider_config
                )
            )

        elif isinstance(
            config,
            AWSBedrockConfig,
        ):
            bedrock_config = config
            provider_config = ProviderConfig(
                provider_id="aws_bedrock",
                timeout_seconds=(
                    config.timeout_seconds
                ),
                connect_timeout_seconds=(
                    config.connect_timeout_seconds
                ),
                max_retries=config.max_retries,
                retry_enabled=config.retry_enabled,
                enabled=config.enabled,
                base_url=config.endpoint_url,
            )

        else:
            provider_config = config
            bedrock_config = (
                AWSBedrockConfig.from_provider_config(
                    config
                )
            )

        super().__init__(
            provider_config
        )

        self.bedrock_config = bedrock_config

        self.client = AWSBedrockClient(
            bedrock_config
        )

        self.chat_client = AWSBedrockChat(
            self.client
        )

        self.tokenizer = AWSBedrockTokenizer()

        self._models: dict[
            str,
            AWSBedrockModel,
        ] = {
            model.id: model
            for model in DEFAULT_AWS_BEDROCK_MODELS
        }

    @property
    def metadata(self) -> ProviderMetadata:
        return ProviderMetadata(
            provider_id="aws_bedrock",
            display_name="AWS Bedrock",
            website="https://aws.amazon.com/bedrock/",
        )

    async def initialize(self) -> None:
        if not self.bedrock_config.enabled:
            self._initialized = False
            return

        self._initialized = True

    async def close(self) -> None:
        self.client.close()
        self._initialized = False

    async def health_check(
        self,
    ) -> ProviderHealth:
        if not self.bedrock_config.enabled:
            return ProviderHealth(
                provider_id="aws_bedrock",
                status="disabled",
                message="AWS Bedrock provider is disabled",
            )

        if not self.bedrock_config.configured:
            return ProviderHealth(
                provider_id="aws_bedrock",
                status="unknown",
                message=(
                    "AWS credentials are not configured"
                ),
            )

        healthy = await self.client.health_check()

        if healthy:
            return ProviderHealth(
                provider_id="aws_bedrock",
                status="ready",
                message="AWS Bedrock is reachable",
            )

        return ProviderHealth(
            provider_id="aws_bedrock",
            status="degraded",
            message="AWS Bedrock health check failed",
        )

    async def list_models(
        self,
    ) -> list:
        if not self.bedrock_config.configured:
            return [
                model.to_model_info()
                for model in self._models.values()
            ]

        try:
            summaries = (
                await self.client.list_models()
            )

            discovered: dict[
                str,
                AWSBedrockModel,
            ] = {}

            for summary in summaries:
                model = parse_model_summary(
                    summary
                )

                if model is not None:
                    discovered[model.id] = model

            if discovered:
                self._models = discovered

        except Exception:
            pass

        return [
            model.to_model_info()
            for model in self._models.values()
        ]

    def supports_model(
        self,
        model: str,
    ) -> bool:
        normalized = model.strip().lower()

        for candidate in self._models.values():
            if candidate.id.lower() == normalized:
                return True

            if any(
                alias.lower() == normalized
                for alias in candidate.aliases
            ):
                return True

        return False

    async def chat(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        self.ensure_enabled()
        await self.ensure_initialized()

        if not self.supports_model(
            request.model
        ):
            raise ValueError(
                f"Unsupported AWS Bedrock model: "
                f"{request.model}"
            )

        if not self.bedrock_config.configured:
            raise RuntimeError(
                "AWS Bedrock credentials are not configured"
            )

        return await self.chat_client.complete(
            request
        )

    async def stream(
        self,
        request: ChatRequest,
    ) -> AsyncIterator[StreamChunk]:
        self.ensure_enabled()
        await self.ensure_initialized()

        if not self.supports_model(
            request.model
        ):
            raise ValueError(
                f"Unsupported AWS Bedrock model: "
                f"{request.model}"
            )

        if not self.bedrock_config.configured:
            raise RuntimeError(
                "AWS Bedrock credentials are not configured"
            )

        payload = request_to_converse_payload(
            request
        )

        parser = AWSBedrockStreamParser(
            model=request.model,
            request_id=str(
                request.request_id
            ),
        )

        async for event in self.client.stream(
            payload
        ):
            chunk = parser.parse_event(
                event
            )

            if chunk is not None:
                yield chunk
