from __future__ import annotations

from typing import Any, Type

from ..base.provider import BaseProvider


class ProviderBuilder:
    """
    Builds concrete ModelNow provider instances.

    Provider-specific configuration is supplied through kwargs.
    The builder does not perform routing or inference.
    """

    def __init__(self) -> None:
        self._classes: dict[str, Type[BaseProvider]] = {}

    def register_class(
        self,
        provider_id: str,
        provider_class: Type[BaseProvider],
    ) -> None:
        provider_id = provider_id.strip().lower()

        if not provider_id:
            raise ValueError(
                "provider_id cannot be empty."
            )

        if not isinstance(provider_class, type):
            raise TypeError(
                "provider_class must be a class."
            )

        if not issubclass(provider_class, BaseProvider):
            raise TypeError(
                f"{provider_class.__name__} must "
                "inherit from BaseProvider."
            )

        self._classes[provider_id] = provider_class

    def build(
        self,
        provider_id: str,
        **kwargs: Any,
    ) -> BaseProvider:
        provider_id = provider_id.strip().lower()

        provider_class = self._classes.get(provider_id)

        if provider_class is None:
            raise ValueError(
                f"No provider implementation registered "
                f"for '{provider_id}'."
            )

        return provider_class(**kwargs)

    def exists(
        self,
        provider_id: str,
    ) -> bool:
        return provider_id.strip().lower() in self._classes

    def all(
        self,
    ) -> dict[str, Type[BaseProvider]]:
        return dict(self._classes)


__all__ = [
    "ProviderBuilder",
]
