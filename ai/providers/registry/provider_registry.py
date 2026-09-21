from __future__ import annotations

from dataclasses import dataclass
from threading import RLock
from typing import Type

from ai.providers.base.models import (
    Capability,
    ProviderType,
)
from ai.providers.base.provider import BaseProvider


@dataclass(frozen=True)
class ProviderMetadata:
    name: str
    provider_type: ProviderType

    display_name: str | None = None

    capabilities: frozenset[Capability] = frozenset()

    priority: int = 100

    enabled: bool = True

    metadata: dict = None

    def __post_init__(self):
        if self.metadata is None:
            object.__setattr__(
                self,
                "metadata",
                {},
            )


@dataclass(frozen=True)
class ProviderEntry:
    metadata: ProviderMetadata
    provider_class: Type[BaseProvider]


class ProviderRegistry:
    """
    Thread-safe registry for concrete ModelNow providers.

    IMPORTANT:
    BaseProvider itself must never be registered.
    Only concrete implementations are allowed.
    """

    def __init__(self) -> None:
        self._providers: dict[str, ProviderEntry] = {}
        self._lock = RLock()

    @staticmethod
    def _normalize(name: str) -> str:
        if not name:
            raise ValueError(
                "Provider name cannot be empty."
            )

        return (
            name.strip()
            .lower()
            .replace("-", "_")
            .replace(" ", "_")
        )

    def register(
        self,
        *,
        name: str,
        provider_class: Type[BaseProvider],
        metadata: ProviderMetadata,
        overwrite: bool = False,
    ) -> None:

        normalized = self._normalize(name)

        if not isinstance(
            provider_class,
            type,
        ):
            raise TypeError(
                "provider_class must be a class."
            )

        if provider_class is BaseProvider:
            raise TypeError(
                "BaseProvider is abstract and cannot be registered."
            )

        if not issubclass(
            provider_class,
            BaseProvider,
        ):
            raise TypeError(
                f"{provider_class.__name__} must inherit "
                "from BaseProvider."
            )

        with self._lock:

            if (
                normalized in self._providers
                and not overwrite
            ):
                raise ValueError(
                    f"Provider '{normalized}' "
                    "is already registered."
                )

            self._providers[normalized] = ProviderEntry(
                metadata=metadata,
                provider_class=provider_class,
            )

    def unregister(
        self,
        name: str,
    ) -> bool:

        normalized = self._normalize(name)

        with self._lock:
            return (
                self._providers.pop(
                    normalized,
                    None,
                )
                is not None
            )

    def get(
        self,
        name: str,
    ) -> ProviderEntry:

        normalized = self._normalize(name)

        with self._lock:
            entry = self._providers.get(normalized)

        if entry is None:
            raise KeyError(
                f"Provider '{normalized}' is not registered."
            )

        return entry

    def get_class(
        self,
        name: str,
    ) -> Type[BaseProvider]:

        return self.get(name).provider_class

    def get_metadata(
        self,
        name: str,
    ) -> ProviderMetadata:

        return self.get(name).metadata

    def exists(
        self,
        name: str,
    ) -> bool:

        normalized = self._normalize(name)

        with self._lock:
            return normalized in self._providers

    def enable(
        self,
        name: str,
    ) -> None:

        normalized = self._normalize(name)

        with self._lock:
            entry = self._providers.get(normalized)

            if entry is None:
                raise KeyError(
                    f"Provider '{normalized}' is not registered."
                )

            metadata = entry.metadata

            updated = ProviderMetadata(
                name=metadata.name,
                provider_type=metadata.provider_type,
                display_name=metadata.display_name,
                capabilities=metadata.capabilities,
                priority=metadata.priority,
                enabled=True,
                metadata=dict(metadata.metadata),
            )

            self._providers[normalized] = ProviderEntry(
                metadata=updated,
                provider_class=entry.provider_class,
            )

    def disable(
        self,
        name: str,
    ) -> None:

        normalized = self._normalize(name)

        with self._lock:
            entry = self._providers.get(normalized)

            if entry is None:
                raise KeyError(
                    f"Provider '{normalized}' is not registered."
                )

            metadata = entry.metadata

            updated = ProviderMetadata(
                name=metadata.name,
                provider_type=metadata.provider_type,
                display_name=metadata.display_name,
                capabilities=metadata.capabilities,
                priority=metadata.priority,
                enabled=False,
                metadata=dict(metadata.metadata),
            )

            self._providers[normalized] = ProviderEntry(
                metadata=updated,
                provider_class=entry.provider_class,
            )

    def list(
        self,
        *,
        enabled_only: bool = False,
    ) -> list[ProviderEntry]:

        with self._lock:
            entries = list(
                self._providers.values()
            )

        if enabled_only:
            entries = [
                entry
                for entry in entries
                if entry.metadata.enabled
            ]

        return sorted(
            entries,
            key=lambda entry: (
                entry.metadata.priority,
                entry.metadata.name,
            ),
        )

    def names(
        self,
        *,
        enabled_only: bool = False,
    ) -> list[str]:

        return [
            entry.metadata.name
            for entry in self.list(
                enabled_only=enabled_only
            )
        ]

    def find_by_type(
        self,
        provider_type: ProviderType,
    ) -> list[ProviderEntry]:

        return [
            entry
            for entry in self.list()
            if entry.metadata.provider_type
            == provider_type
        ]

    def find_by_capability(
        self,
        capability: Capability,
    ) -> list[ProviderEntry]:

        return [
            entry
            for entry in self.list(
                enabled_only=True
            )
            if capability
            in entry.metadata.capabilities
        ]

    def clear(self) -> None:
        with self._lock:
            self._providers.clear()

    def count(self) -> int:
        with self._lock:
            return len(self._providers)