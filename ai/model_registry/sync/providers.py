from __future__ import annotations

from collections.abc import Iterable

from ..interfaces import ModelSource
from ..models import ModelRecord


class SyncProvider:
    """
    Adapter wrapper used by the sync layer.

    A SyncProvider supplies normalized ModelRecord objects from
    an underlying ModelSource.
    """

    def __init__(
        self,
        source: ModelSource,
    ) -> None:
        self.source = source

    @property
    def provider(self) -> str:
        return self.source.provider

    def discover_models(self) -> list[ModelRecord]:
        models = self.source.discover_models()

        return list(models)


class ProviderCollection:
    """
    Collection of provider sync sources.
    """

    def __init__(
        self,
        providers: Iterable[SyncProvider] | None = None,
    ) -> None:
        self._providers: list[SyncProvider] = list(
            providers or []
        )

    def add(
        self,
        provider: SyncProvider,
    ) -> None:
        if provider not in self._providers:
            self._providers.append(provider)

    def remove(
        self,
        provider_name: str,
    ) -> bool:
        value = provider_name.strip().lower()

        original_count = len(self._providers)

        self._providers = [
            provider
            for provider in self._providers
            if provider.provider.strip().lower()
            != value
        ]

        return len(self._providers) < original_count

    def list(self) -> list[SyncProvider]:
        return list(self._providers)

    def providers(self) -> set[str]:
        return {
            provider.provider
            for provider in self._providers
        }

    def count(self) -> int:
        return len(self._providers)


__all__ = [
    "SyncProvider",
    "ProviderCollection",
]
