@'
from __future__ import annotations

from typing import Dict, Type

from ..base.provider import BaseProvider


class ProviderResolutionError(Exception):
    """Raised when a provider implementation cannot be resolved."""


class ProviderResolver:
    """
    Maps logical provider IDs to concrete Python provider classes.

    Example:

        openai   -> OpenAIProvider
        anthropic -> AnthropicProvider
        google   -> GoogleProvider
        deepseek -> DeepSeekProvider

    This prevents application code from importing provider
    implementations directly.
    """

    def __init__(self) -> None:
        self._providers: Dict[
            str,
            Type[BaseProvider],
        ] = {}

    def register(
        self,
        provider_id: str,
        provider_class: Type[BaseProvider],
    ) -> None:

        if not provider_id:
            raise ProviderResolutionError(
                "Provider ID cannot be empty."
            )

        if not issubclass(
            provider_class,
            BaseProvider,
        ):
            raise ProviderResolutionError(
                f"{provider_class.__name__} must "
                "inherit from BaseProvider."
            )

        self._providers[
            provider_id
        ] = provider_class

    def resolve(
        self,
        provider_id: str,
    ) -> Type[BaseProvider]:

        provider = self._providers.get(
            provider_id
        )

        if provider is None:
            raise ProviderResolutionError(
                f"No implementation found for "
                f"provider '{provider_id}'."
            )

        return provider

    def exists(
        self,
        provider_id: str,
    ) -> bool:

        return provider_id in self._providers

    def all(
        self,
    ) -> Dict[str, Type[BaseProvider]]:

        return dict(self._providers)
'@ | Set-Content ".\ai\providers\provider_factory\resolver.py" -Encoding UTF8