"""
Central embedding provider manager.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .factory import ProviderFactory
from .registry import ProviderRegistry
from .utils import (
    get_embeddings,
    get_provider_dimension,
    normalize_provider_name,
)


@dataclass
class ProviderInfo:
    """Information about a provider."""

    name: str

    provider: Any

    dimensions: int | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "dimensions": self.dimensions,
            "metadata": dict(self.metadata),
        }


class EmbeddingManager:
    """
    Central manager for all embedding providers.

    Example:

        manager.register("e5", E5Provider)

        provider = manager.get("e5")

        vectors = manager.embed(
            "e5",
            ["hello", "world"]
        )
    """

    def __init__(
        self,
        default_provider: str | None = None,
    ) -> None:

        self.registry = ProviderRegistry()

        self.factory = ProviderFactory(
            self.registry
        )

        self._instances: dict[
            str,
            Any,
        ] = {}

        self.default_provider = (
            normalize_provider_name(
                default_provider
            )
            if default_provider
            else None
        )

    def register(
        self,
        name: str,
        provider: Any,
        overwrite: bool = False,
    ) -> None:

        normalized = normalize_provider_name(
            name
        )

        self.registry.register(
            normalized,
            provider,
            overwrite=overwrite,
        )

        if overwrite:

            self._instances.pop(
                normalized,
                None,
            )

    def unregister(
        self,
        name: str,
    ) -> bool:

        normalized = normalize_provider_name(
            name
        )

        self._instances.pop(
            normalized,
            None,
        )

        return self.registry.unregister(
            normalized
        )

    def get(
        self,
        name: str | None = None,
        **kwargs: Any,
    ) -> Any:

        provider_name = (
            normalize_provider_name(name)
            if name
            else self.default_provider
        )

        if not provider_name:

            raise ValueError(
                "No provider specified and "
                "no default provider configured"
            )

        if (
            not kwargs
            and provider_name
            in self._instances
        ):

            return self._instances[
                provider_name
            ]

        provider = self.factory.create(
            provider_name,
            **kwargs,
        )

        if not kwargs:

            self._instances[
                provider_name
            ] = provider

        return provider

    def set_default(
        self,
        name: str,
    ) -> None:

        name = normalize_provider_name(
            name
        )

        if not self.registry.contains(
            name
        ):

            raise KeyError(
                f"Provider '{name}' is not registered"
            )

        self.default_provider = name

    def embed(
        self,
        texts: list[str],
        provider: str | None = None,
        **kwargs: Any,
    ) -> list[list[float]]:

        instance = self.get(
            provider,
            **kwargs,
        )

        return get_embeddings(
            instance,
            texts,
        )

    def embed_one(
        self,
        text: str,
        provider: str | None = None,
        **kwargs: Any,
    ) -> list[float]:

        instance = self.get(
            provider,
            **kwargs,
        )

        if hasattr(
            instance,
            "embed",
        ):

            return instance.embed(
                text
            )

        return get_embeddings(
            instance,
            [text],
        )[0]

    def dimension(
        self,
        provider: str | None = None,
        **kwargs: Any,
    ) -> int:

        instance = self.get(
            provider,
            **kwargs,
        )

        return get_provider_dimension(
            instance
        )

    def info(
        self,
        provider: str | None = None,
        **kwargs: Any,
    ) -> ProviderInfo:

        instance = self.get(
            provider,
            **kwargs,
        )

        name = (
            normalize_provider_name(
                provider
            )
            if provider
            else self.default_provider
        )

        metadata = {}

        if hasattr(
            instance,
            "info",
        ):

            metadata = instance.info()

        dimensions = None

        try:
            dimensions = (
                get_provider_dimension(
                    instance
                )
            )
        except Exception:
            pass

        return ProviderInfo(
            name=name or "unknown",
            provider=instance,
            dimensions=dimensions,
            metadata=metadata,
        )

    def list_providers(
        self,
    ) -> list[str]:

        return self.registry.names()

    def clear_instances(self) -> None:

        self._instances.clear()

    def clear(self) -> None:

        self._instances.clear()

        self.registry.clear()

        self.default_provider = None