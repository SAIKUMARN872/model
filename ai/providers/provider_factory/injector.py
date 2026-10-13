from __future__ import annotations

import inspect
from typing import Any

from ..base.provider import BaseProvider


class DependencyInjector:
    """Lightweight dependency injection helper for provider construction."""

    def __init__(self, dependencies: dict[str, Any] | None = None) -> None:
        self._dependencies = dict(dependencies or {})

    def add(self, name: str, dependency: Any) -> None:
        self._dependencies[name] = dependency

    def get(self, name: str, default: Any = None) -> Any:
        return self._dependencies.get(name, default)

    def build(
        self,
        provider_class: type[BaseProvider],
        **overrides: Any,
    ) -> BaseProvider:
        if not issubclass(provider_class, BaseProvider):
            raise TypeError(
                f"{provider_class.__name__} must inherit from BaseProvider."
            )

        available = dict(self._dependencies)
        available.update(overrides)

        signature = inspect.signature(provider_class.__init__)
        parameters = signature.parameters

        accepted = {
            key: value
            for key, value in available.items()
            if key in parameters
        }

        return provider_class(**accepted)


__all__ = ["DependencyInjector"]
