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
from ai.providers.base.response import ChatResponse, StreamChunk

from .chat import AzureOpenAIChat
from .client import AzureOpenAIClient
from .config import AzureOpenAIConfig
from .models import DEFAULT_AZURE_DEPLOYMENTS, AzureDeployment
from .stream import AzureOpenAIStreamParser


class AzureOpenAIProvider(BaseProvider):
    name = "azure_openai"
    version = "1.0"

    def __init__(
        self,
        config: ProviderConfig | AzureOpenAIConfig | None = None,
        deployments: tuple[AzureDeployment, ...] = DEFAULT_AZURE_DEPLOYMENTS,
    ) -> None:
        if config is None:
            azure_config = AzureOpenAIConfig.from_env()

            config = ProviderConfig(
                provider_id="azure_openai",
                api_key=azure_config.api_key,
                base_url=azure_config.endpoint,
                timeout_seconds=azure_config.timeout_seconds,
                connect_timeout_seconds=azure_config.connect_timeout_seconds,
                max_retries=azure_config.max_retries,
                enabled=azure_config.enabled,
            )
        elif isinstance(config, AzureOpenAIConfig):
            azure_config = config

            config = ProviderConfig(
                provider_id="azure_openai",
                api_key=config.api_key,
                base_url=config.endpoint,
                timeout_seconds=config.timeout_seconds,
                connect_timeout_seconds=config.connect_timeout_seconds,
                max_retries=config.max_retries,
                enabled=config.enabled,
            )
        else:
            azure_config = AzureOpenAIConfig(
                endpoint=config.base_url or "",
                api_key=config.api_key,
                timeout_seconds=config.timeout_seconds,
                connect_timeout_seconds=config.connect_timeout_seconds,
                max_retries=config.max_retries,
                enabled=config.enabled,
            )

        super().__init__(config)

        self.azure_config = azure_config
        self.deployments = deployments
        self.client: AzureOpenAIClient | None = None
        self._chat: AzureOpenAIChat | None = None

    @property
    def metadata(self) -> ProviderMetadata:
        return ProviderMetadata(
            name=self.name,
            version=self.version,
            tier=ProviderTier.LLM,
            status=(
                ProviderStatus.READY
                if self.initialized
                else ProviderStatus.UNKNOWN
            ),
            metadata={
                "endpoint": self.azure_config.endpoint,
                "deployment_count": str(len(self.deployments)),
            },
        )

    async def initialize(self) -> None:
        if self.initialized:
            return

        self.ensure_enabled()

        self.client = AzureOpenAIClient(self.config)
        await self.client.initialize()

        self._chat = AzureOpenAIChat(self.client)
        self._initialized = True

    async def close(self) -> None:
        if self.client is not None:
            await self.client.close()

        self.client = None
        self._chat = None
        self._initialized = False

    async def health_check(self) -> ProviderHealth:
        if not self.config.enabled:
            return ProviderHealth(
                provider=self.name,
                status=ProviderStatus.DISABLED,
                healthy=False,
                message="Provider is disabled",
            )

        if not self.azure_config.configured:
            return ProviderHealth(
                provider=self.name,
                status=ProviderStatus.UNAVAILABLE,
                healthy=False,
                message="Azure OpenAI credentials are not configured",
            )

        return ProviderHealth(
            provider=self.name,
            status=(
                ProviderStatus.READY
                if self.initialized
                else ProviderStatus.UNKNOWN
            ),
            healthy=True,
            message="Azure OpenAI configuration is available",
        )

    async def list_models(self) -> list[ModelInfo]:
        return [
            deployment.model_info
            for deployment in self.deployments
            if deployment.enabled
        ]

    async def supports_model(self, model_id: str) -> bool:
        normalized = model_id.strip().lower()

        return any(
            normalized == deployment.deployment_name.lower()
            or normalized == deployment.model_name.lower()
            for deployment in self.deployments
            if deployment.enabled
        )

    async def chat(self, request: ChatRequest) -> ChatResponse:
        if not self.initialized:
            await self.initialize()

        if not await self.supports_model(request.model):
            raise ValueError(
                f"Unsupported Azure OpenAI deployment: {request.model}"
            )

        if self._chat is None:
            raise RuntimeError("Azure OpenAI chat client is unavailable")

        return await self._chat.execute(request)

    async def stream(self, request: ChatRequest):
        if not self.initialized:
            await self.initialize()

        if self.client is None:
            raise RuntimeError(
                "Azure OpenAI client is unavailable"
            )

        payload = {
            "messages": [
                {
                    "role": message.role,
                    "content": message.content,
                }
                for message in request.messages
            ],
            "stream": True,
        }

        if request.temperature is not None:
            payload["temperature"] = request.temperature

        if request.max_tokens is not None:
            payload["max_tokens"] = request.max_tokens

        if request.top_p is not None:
            payload["top_p"] = request.top_p

        async for chunk in self.client.stream(
            request.model,
            payload,
        ):
            yield chunk
