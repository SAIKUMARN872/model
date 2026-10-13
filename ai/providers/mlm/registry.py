from __future__ import annotations

import inspect
from collections.abc import Iterable

from ..base.models import ModelInfo
from ..base.provider import BaseProvider


class MLMProviderRegistry:
    """
    Registry for ModelNow medium-language-model providers.

    The registry owns provider instances and provides normalized
    provider/model discovery without changing the global routing layer.
    """

    def __init__(self) -> None:
        self._providers: dict[str, BaseProvider] = {}

    def register(
        self,
        provider: BaseProvider,
    ) -> None:
        """Register or replace a provider by normalized provider ID."""

        if not isinstance(provider, BaseProvider):
            raise TypeError(
                "provider must be a BaseProvider instance."
            )

        provider_id = provider.config.provider_id.strip().lower()

        if not provider_id:
            raise ValueError(
                "Provider ID cannot be empty."
            )

        self._providers[provider_id] = provider

    def register_many(
        self,
        providers: Iterable[BaseProvider],
    ) -> None:
        """Register multiple providers."""

        for provider in providers:
            self.register(provider)

    def get(
        self,
        provider_id: str,
    ) -> BaseProvider | None:
        """Return a provider by ID."""

        if not isinstance(provider_id, str):
            raise TypeError(
                "provider_id must be a string."
            )

        return self._providers.get(
            provider_id.strip().lower()
        )

    def require(
        self,
        provider_id: str,
    ) -> BaseProvider:
        """Return a provider or raise KeyError."""

        provider = self.get(provider_id)

        if provider is None:
            raise KeyError(
                f"MLM provider '{provider_id}' is not registered."
            )

        return provider

    def remove(
        self,
        provider_id: str,
    ) -> BaseProvider | None:
        """Remove and return a provider by ID."""

        if not isinstance(provider_id, str):
            raise TypeError(
                "provider_id must be a string."
            )

        return self._providers.pop(
            provider_id.strip().lower(),
            None,
        )

    def providers(self) -> list[BaseProvider]:
        """Return registered providers."""

        return list(self._providers.values())

    def provider_ids(self) -> list[str]:
        """Return registered provider IDs."""

        return list(self._providers.keys())

    async def list_models(self) -> list[ModelInfo]:
        """Discover models from all registered providers."""

        models: list[ModelInfo] = []

        for provider in self._providers.values():
            provider_models = await provider.list_models()

            for model in provider_models:
                if not isinstance(model, ModelInfo):
                    raise TypeError(
                        "Provider list_models() must return "
                        "ModelInfo instances."
                    )

            models.extend(provider_models)

        return models

    async def find_model(
        self,
        model_id: str,
    ) -> ModelInfo | None:
        """Find a model by ID or alias."""

        normalized = model_id.strip().lower()

        if not normalized:
            raise ValueError(
                "model_id cannot be empty."
            )

        for model in await self.list_models():
            if model.matches(normalized):
                return model

        return None

    async def provider_for_model(
        self,
        model_id: str,
    ) -> BaseProvider | None:
        """
        Find the provider that supports a model.

        Supports both the current asynchronous provider contract and
        legacy synchronous supports_model() implementations.
        """

        normalized = model_id.strip().lower()

        if not normalized:
            raise ValueError(
                "model_id cannot be empty."
            )

        for provider in self._providers.values():
            result = provider.supports_model(normalized)

            if inspect.isawaitable(result):
                result = await result

            if result:
                return provider

        return None

    def count(self) -> int:
        """Return the number of registered providers."""

        return len(self._providers)

    def clear(self) -> None:
        """Remove all registered providers."""

        self._providers.clear()


__all__ = [
    "MLMProviderRegistry",
]
