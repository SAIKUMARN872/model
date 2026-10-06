from __future__ import annotations

import importlib
from typing import Any

from ..base.provider import BaseProvider


class ProviderLoadError(Exception):
    """Raised when a provider implementation cannot be loaded."""


class ProviderLoader:
    """Dynamically loads provider classes from Python modules."""

    def load(
        self,
        module_name: str,
        class_name: str,
    ) -> type[BaseProvider]:
        if not module_name:
            raise ProviderLoadError("module_name cannot be empty.")

        if not class_name:
            raise ProviderLoadError("class_name cannot be empty.")

        try:
            module = importlib.import_module(module_name)
        except ImportError as exc:
            raise ProviderLoadError(
                f"Unable to import provider module '{module_name}'."
            ) from exc

        provider_class = getattr(module, class_name, None)

        if provider_class is None:
            raise ProviderLoadError(
                f"Class '{class_name}' was not found "
                f"in module '{module_name}'."
            )

        if not isinstance(provider_class, type):
            raise ProviderLoadError(
                f"{module_name}.{class_name} is not a class."
            )

        if not issubclass(provider_class, BaseProvider):
            raise ProviderLoadError(
                f"{module_name}.{class_name} must inherit from BaseProvider."
            )

        return provider_class

    def load_from_config(
        self,
        config: dict[str, Any],
    ) -> type[BaseProvider]:
        try:
            module_name = config["module"]
            class_name = config["class"]
        except KeyError as exc:
            raise ProviderLoadError(
                f"Missing provider configuration key: {exc.args[0]}"
            ) from exc

        return self.load(
            module_name=module_name,
            class_name=class_name,
        )


__all__ = ["ProviderLoadError", "ProviderLoader"]
