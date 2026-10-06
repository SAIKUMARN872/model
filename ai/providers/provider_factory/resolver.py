from __future__ import annotations

from ..base.provider import BaseProvider


class ProviderResolutionError(Exception):
    """Raised when a provider implementation cannot be resolved."""


class ProviderResolver:
    """Maps logical provider IDs to concrete provider classes."""

    def __init__(self) -> None:
        self._providers: dict[str, type[BaseProvider]] = {}

    def register(
        self,
        provider_id: str,
        provider_class: type[BaseProvider],
        *,
        overwrite: bool = False,
    ) -> None:
        provider_id = provider_id.strip().lower()

        if not provider_id:
            raise ProviderResolutionError(
                "Provider ID cannot be empty."
            )

        if not issubclass(provider_class, BaseProvider):
            raise ProviderResolutionError(
                f"{provider_class.__name__} must inherit from BaseProvider."
            )

        if provider_id in self._providers and not overwrite:
            raise ProviderResolutionError(
                f"Provider '{provider_id}' is already registered."
            )

        self._providers[provider_id] = provider_class

    def resolve(self, provider_id: str) -> type[BaseProvider]:
        provider_id = provider_id.strip().lower()

        provider = self._providers.get(provider_id)

        if provider is None:
            raise ProviderResolutionError(
                f"No implementation found for provider '{provider_id}'."
            )

        return provider

    def exists(self, provider_id: str) -> bool:
        return provider_id.strip().lower() in self._providers

    def all(self) -> dict[str, type[BaseProvider]]:
        return dict(self._providers)

    def remove(self, provider_id: str) -> type[BaseProvider] | None:
        return self._providers.pop(
            provider_id.strip().lower(),
            None,
        )

    def clear(self) -> None:
        self._providers.clear()


__all__ = ["ProviderResolutionError", "ProviderResolver"]
