from __future__ import annotations

from typing import Any

from ..base.provider import BaseProvider
from ..registry.registry import AIRegistry
from .builder import ProviderBuilder


class ProviderFactory:
    """
    Central provider construction service.

    Responsibilities:
        - resolve registered provider metadata
        - verify provider implementation availability
        - construct concrete provider instances

    Routing and inference remain outside this component.
    """

    def __init__(
        self,
        registry: AIRegistry,
        builder: ProviderBuilder,
    ) -> None:
        self.registry = registry
        self.builder = builder

    def create(
        self,
        provider_id: str,
        **kwargs: Any,
    ) -> BaseProvider:
        provider_id = provider_id.strip().lower()

        metadata = self.registry.providers.get_metadata(
            provider_id
        )

        if not metadata:
            raise ValueError(
                f"Provider '{provider_id}' is not registered."
            )

        if not self.builder.exists(provider_id):
            raise ValueError(
                f"No provider implementation registered "
                f"for '{provider_id}'."
            )

        return self.builder.build(
            provider_id,
            **kwargs,
        )

    def supports(
        self,
        provider_id: str,
    ) -> bool:
        provider_id = provider_id.strip().lower()

        return (
            self.registry.providers.exists(provider_id)
            and self.builder.exists(provider_id)
        )


__all__ = [
    "ProviderFactory",
]
