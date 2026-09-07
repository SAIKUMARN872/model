from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Dict, Optional, Type

from ai.providers.base.provider import BaseProvider
from ai.providers.base.config import ProviderConfig
from ai.providers.base.exceptions import ProviderException


class ProviderTier(str, Enum):
    SLM = "slm"
    MLM = "mlm"
    LLM = "llm"


@dataclass(frozen=True)
class ProviderMeta:
    name: str
    tier: ProviderTier
    default_model: str
    supports_streaming: bool = True
    supports_tools: bool = False
    supports_vision: bool = False
    supports_audio: bool = False
    supports_embeddings: bool = False
    supports_image_generation: bool = False


class ProviderRegistry:
    """
    Central provider registry used by the routing engine.
    """

    _providers: Dict[str, Type[BaseProvider]] = {}
    _metadata: Dict[str, ProviderMeta] = {}

    @classmethod
    def register(
        cls,
        provider_name: str,
        provider_cls: Type[BaseProvider],
        metadata: ProviderMeta,
    ) -> None:
        cls._providers[provider_name] = provider_cls
        cls._metadata[provider_name] = metadata

    @classmethod
    def get_provider(cls, provider_name: str) -> Type[BaseProvider]:
        if provider_name not in cls._providers:
            raise ProviderException(f"Provider not registered: {provider_name}")
        return cls._providers[provider_name]

    @classmethod
    def get_metadata(cls, provider_name: str) -> ProviderMeta:
        if provider_name not in cls._metadata:
            raise ProviderException(f"Metadata not found: {provider_name}")
        return cls._metadata[provider_name]

    @classmethod
    def list_providers(cls) -> Dict[str, ProviderMeta]:
        return cls._metadata


class ProviderFactory:
    """
    Factory responsible for creating provider instances.
    """

    @staticmethod
    def create(
        provider_name: str,
        config: ProviderConfig,
    ) -> BaseProvider:
        provider_cls = ProviderRegistry.get_provider(provider_name)
        return provider_cls(config)


def register_default_providers() -> None:
    """
    Register built-in providers.
    Replace BaseProvider with concrete provider implementations.
    """

    ProviderRegistry.register(
        provider_name="openai",
        provider_cls=BaseProvider,
        metadata=ProviderMeta(
            name="openai",
            tier=ProviderTier.LLM,
            default_model="gpt-4o-mini",
            supports_streaming=True,
            supports_tools=True,
            supports_vision=True,
            supports_audio=True,
            supports_embeddings=True,
            supports_image_generation=True,
        ),
    )

    ProviderRegistry.register(
        provider_name="google",
        provider_cls=BaseProvider,
        metadata=ProviderMeta(
            name="google",
            tier=ProviderTier.LLM,
            default_model="gemini-2.0-flash",
            supports_streaming=True,
            supports_tools=True,
            supports_vision=True,
            supports_audio=True,
        ),
    )

    ProviderRegistry.register(
        provider_name="anthropic",
        provider_cls=BaseProvider,
        metadata=ProviderMeta(
            name="anthropic",
            tier=ProviderTier.LLM,
            default_model="claude-3-5-sonnet-latest",
            supports_streaming=True,
            supports_tools=True,
        ),
    )

    ProviderRegistry.register(
        provider_name="deepseek",
        provider_cls=BaseProvider,
        metadata=ProviderMeta(
            name="deepseek",
            tier=ProviderTier.MLM,
            default_model="deepseek-chat",
            supports_streaming=True,
        ),
    )

    ProviderRegistry.register(
        provider_name="phi",
        provider_cls=BaseProvider,
        metadata=ProviderMeta(
            name="phi",
            tier=ProviderTier.SLM,
            default_model="phi-3-mini",
            supports_streaming=True,
        ),
    )


# Initialize built-in providers when the module is imported.
register_default_providers()