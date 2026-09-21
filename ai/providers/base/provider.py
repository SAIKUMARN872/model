from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import AsyncIterator

from .config import ProviderConfig
from .models import (
    ModelInfo,
    ProviderHealth,
    ProviderMetadata,
)
from .request import ChatRequest
from .response import (
    ChatResponse,
    StreamChunk,
)


class BaseProvider(ABC):
    """
    Abstract provider contract for ModelNow.

    Every concrete AI provider must implement this interface.

    Examples:
        OpenAI
        Anthropic
        Google
        DeepSeek
        Mistral
        xAI
        Cohere
        OpenRouter
        Azure OpenAI
        AWS Bedrock
    """

    name: str = "base"
    version: str = "1.0"

    def __init__(
        self,
        config: ProviderConfig,
    ) -> None:
        self.config = config
        self._initialized = False

    @property
    def initialized(self) -> bool:
        """Return whether the provider has been initialized."""

        return self._initialized

    @property
    def metadata(self) -> ProviderMetadata:
        """
        Return normalized provider metadata.

        Concrete providers can override this when they need
        provider-specific metadata.
        """

        return ProviderMetadata(
            provider_id=self.config.provider_id,
            display_name=self.name,
            version=self.version,
        )

    @abstractmethod
    async def initialize(self) -> None:
        """
        Initialize provider resources.
        """

        raise NotImplementedError

    @abstractmethod
    async def close(self) -> None:
        """
        Release provider resources.
        """

        raise NotImplementedError

    @abstractmethod
    async def health_check(
        self,
    ) -> ProviderHealth:
        """
        Return normalized provider health.
        """

        raise NotImplementedError

    @abstractmethod
    async def list_models(
        self,
    ) -> list[ModelInfo]:
        """
        Return models supported by this provider.
        """

        raise NotImplementedError

    @abstractmethod
    async def chat(
        self,
        request: ChatRequest,
    ) -> ChatResponse:
        """
        Execute a normalized chat request.
        """

        raise NotImplementedError

    async def stream(
        self,
        request: ChatRequest,
    ) -> AsyncIterator[StreamChunk]:
        """
        Stream a chat response.

        Concrete providers should override this when
        streaming is supported.
        """

        raise NotImplementedError(
            f"Streaming is not implemented by provider "
            f"'{self.name}'."
        )

    async def supports_model(
        self,
        model_id: str,
    ) -> bool:
        """
        Determine whether this provider supports a model ID
        or one of its aliases.
        """

        models = await self.list_models()

        normalized = model_id.strip().lower()

        return any(
            normalized == model.id.lower()
            or normalized in {
                alias.lower()
                for alias in model.aliases
            }
            for model in models
        )

    def ensure_initialized(self) -> None:
        """
        Raise when a provider operation requires initialization.
        """

        if not self._initialized:
            raise RuntimeError(
                f"Provider '{self.name}' has not been initialized."
            )

    def ensure_enabled(self) -> None:
        """
        Raise when the provider has been disabled.
        """

        if not self.config.enabled:
            raise RuntimeError(
                f"Provider '{self.name}' is disabled."
            )

    async def __aenter__(self) -> "BaseProvider":
        await self.initialize()
        return self

    async def __aexit__(
        self,
        exc_type,
        exc_value,
        traceback,
    ) -> None:
        await self.close()

