"""
Factory for creating embedding providers.
"""

from __future__ import annotations

import inspect
from typing import Any

from .registry import (
    ProviderRegistry,
)
from .utils import (
    normalize_provider_name,
    validate_provider,
)


class ProviderFactory:
    """
    Creates provider instances from registry entries.
    """

    def __init__(
        self,
        registry: ProviderRegistry,
    ) -> None:

        self.registry = registry

    def create(
        self,
        name: str,
        **kwargs: Any,
    ) -> Any:

        name = normalize_provider_name(
            name
        )

        provider_definition = (
            self.registry.get(name)
        )

        # Existing provider instance.
        if self._looks_like_provider(
            provider_definition
        ):

            if kwargs:
                raise TypeError(
                    f"Provider '{name}' is already "
                    "an instance and does not accept "
                    "factory kwargs"
                )

            return provider_definition

        # Class/factory.
        if callable(
            provider_definition
        ):

            provider = (
                provider_definition(
                    **kwargs
                )
            )

            if inspect.isawaitable(
                provider
            ):

                raise TypeError(
                    "Async provider factories are "
                    "not supported by create(); "
                    "use an async factory"
                )

            validate_provider(
                provider
            )

            return provider

        raise TypeError(
            f"Invalid provider definition: "
            f"{name}"
        )

    async def create_async(
        self,
        name: str,
        **kwargs: Any,
    ) -> Any:

        name = normalize_provider_name(
            name
        )

        definition = self.registry.get(
            name
        )

        if self._looks_like_provider(
            definition
        ):

            if kwargs:
                raise TypeError(
                    "Provider instance does not "
                    "accept factory kwargs"
                )

            return definition

        if not callable(definition):

            raise TypeError(
                f"Invalid provider definition: "
                f"{name}"
            )

        provider = definition(
            **kwargs
        )

        if inspect.isawaitable(
            provider
        ):

            provider = await provider

        validate_provider(
            provider
        )

        return provider

    @staticmethod
    def _looks_like_provider(
        value: Any,
    ) -> bool:

        return any(
            hasattr(value, attribute)
            for attribute in (
                "embed",
                "embed_many",
                "embed_documents",
            )
        )