@'
from __future__ import annotations

import importlib
from typing import Any, Dict, Type

from ..base.provider import BaseProvider


class ProviderLoadError(Exception):
    """Raised when a provider implementation cannot be loaded."""


class ProviderLoader:
    """
    Dynamic provider implementation loader.

    Configuration example:

        {
            "provider_id": "openai",
            "module": "ai.providers.llm.openai.provider",
            "class": "OpenAIProvider"
        }

    This allows ModelNow to add providers without changing
    the core registry architecture.
    """

    def load(
        self,
        module_name: str,
        class_name: str,
    ) -> Type[BaseProvider]:

        if not module_name:
            raise ProviderLoadError(
                "module_name cannot be empty."
            )

        if not class_name:
            raise ProviderLoadError(
                "class_name cannot be empty."
            )

        try:
            module = importlib.import_module(
                module_name
            )
        except ImportError as exc:
            raise ProviderLoadError(
                f"Unable to import provider module "
                f"'{module_name}'."
            ) from exc

        provider_class = getattr(
            module,
            class_name,
            None,
        )

        if provider_class is None:
            raise ProviderLoadError(
                f"Class '{class_name}' was not found "
                f"in module '{module_name}'."
            )

        if not issubclass(
            provider_class,
            BaseProvider,
        ):
            raise ProviderLoadError(
                f"{module_name}.{class_name} must "
                "inherit from BaseProvider."
            )

        return provider_class

    def load_from_config(
        self,
        config: Dict[str, Any],
    ) -> Type[BaseProvider]:

        return self.load(
            module_name=config["module"],
            class_name=config["class"],
        )
'@ | Set-Content ".\ai\providers\provider_factory\loader.py" -Encoding UTF8