@'
from __future__ import annotations

from collections.abc import Sequence

from ai.providers.base import (
    BaseProvider,
    ChatRequest,
    ChatResponse,
    ModelCapability,
    ModelInfo,
    ProviderConfig,
    ProviderHealth,
    ProviderMetadata,
    ProviderStatus,
    ProviderTier,
)

from .chat import build_chat_payload, parse_chat_response
from .client import AzureOpenAIClient
from .config import AzureOpenAIConfig
from .models import AzureDeployment


class AzureOpenAIProvider(BaseProvider):
    name = "azure_openai"
    version = "1.0"

    def __init__(
        self,
        config: ProviderConfig,
        azure_config: AzureOpenAIConfig | None = None,
        deployments: Sequence[AzureDeployment] | None = None,
    ) -> None:
        super().__init__(config)

        self.azure_config = azure_config or AzureOpenAIConfig.from_env()

        self.deployments = tuple(deployments or ())

        self.client = AzureOpenAIClient(
            config=config,
            azure_config=self.azure_config,
        )

        self._status = ProviderStatus.UNKNOWN

    @property
    def metadata(self) -> ProviderMetadata:
        return ProviderMetadata(
            provider_id=self.name,
            display_name="Azure OpenAI",
            version=self.version,
            tier_support=frozenset({ProviderTier.LLM}),
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
                "endpoint": self.azure_config.endpoint,
                "api_version": self.azure_config.api_version,
                "deployment_count": len(self.deployments),
            },
        )

    async def initialize(self) -> None:
        self.ensure_enabled()

        if self._initialized:
            return

        self._status = ProviderStatus.INITIALIZING

        try:
            await self.client.initialize()

            self._initialized = True
            self._status = ProviderStatus.READY

        except Exception:
            self._initialized = False
            self._status = ProviderStatus.UNAVAILABLE
            raise

    async def close(self) -> None:
        await self.client.close()

        self._initialized = False
        self._status = ProviderStatus.CLOSED

    async def health_check(self) -> ProviderHealth:
        if not self._initialized:
            return ProviderHealth(
                provider=self.name,
                healthy=False,
                status=ProviderStatus.UNKNOWN,
                message="Azure OpenAI provider is not initialized.",
            )

        if self._status == ProviderStatus.READY:
            return ProviderHealth(
                provider=self.name,
                healthy=True,
                status=ProviderStatus.READY,
                message="Azure OpenAI client is initialized.",
            )

        return ProviderHealth(
            provider=self.name,
            healthy=False,
            status=self._status,
            message=f"Azure OpenAI provider status: {self._status.value}.",
        )

    async def list_models(self) -> list[ModelInfo]:
        return [
            deployment.model_info
            for deployment in self.deployments
            if deployment.enabled
        ]

    async def chat(self, request: ChatRequest) -> ChatResponse:
        await self.ensure_initialized_async()

        payload = build_chat_payload(request)

        raw_response = await self.client.request(
            method="POST",
            path="/chat/completions",
            json=payload,
        )

        return parse_chat_response(raw_response)

    async def supports_model(self, model_id: str) -> bool:
        if not model_id:
            return False

        for deployment in self.deployments:
            if not deployment.enabled:
                continue

            if deployment.deployment_name == model_id:
                return True

            if deployment.model_name == model_id:
                return True

        return False

    async def ensure_initialized_async(self) -> None:
        self.ensure_enabled()

        if not self._initialized:
            await self.initialize()


__all__ = ["AzureOpenAIProvider"]
'@ | Set-Content ".\ai\providers\llm\azure_openai\provider.py"