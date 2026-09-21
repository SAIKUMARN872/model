from __future__ import annotations

from typing import Iterable

from ..base.models import ModelInfo
from ..base.provider import BaseProvider


class SLMProviderRegistry:
    """Registry for local Small Language Model providers."""

    def __init__(self) -> None:
        self._providers: dict[str, BaseProvider] = {}

    def register(self, provider: BaseProvider) -> None:
        provider_id = provider.config.provider_id.strip().lower()

        if not provider_id:
            raise ValueError("Provider ID cannot be empty.")

        self._providers[provider_id] = provider

    def register_many(self, providers: Iterable[BaseProvider]) -> None:
        for provider in providers:
            self.register(provider)

    def get(self, provider_id: str) -> BaseProvider | None:
        return self._providers.get(provider_id.strip().lower())

    def require(self, provider_id: str) -> BaseProvider:
        provider = self.get(provider_id)

        if provider is None:
            raise KeyError(
                f"SLM provider '{provider_id}' is not registered."
            )

        return provider

    def remove(self, provider_id: str) -> BaseProvider | None:
        return self._providers.pop(provider_id.strip().lower(), None)

    def providers(self) -> list[BaseProvider]:
        return list(self._providers.values())

    def provider_ids(self) -> list[str]:
        return list(self._providers.keys())

    async def list_models(self) -> list[ModelInfo]:
        models: list[ModelInfo] = []

        for provider in self._providers.values():
            models.extend(await provider.list_models())

        return models

    async def find_model(self, model_id: str) -> ModelInfo | None:
        normalized = model_id.strip().lower()

        for model in await self.list_models():
            if model.matches(normalized):
                return model

        return None

    async def provider_for_model(
        self,
        model_id: str,
    ) -> BaseProvider | None:
        normalized = model_id.strip().lower()

        for provider in self._providers.values():
            if await provider.supports_model(normalized):
                return provider

        return None

    def count(self) -> int:
        return len(self._providers)

    def clear(self) -> None:
        self._providers.clear()


__all__ = ["SLMProviderRegistry"]
