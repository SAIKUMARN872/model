"""
Provider registry.

Manages registration and retrieval of
external providers such as:

- LLM providers
- AI model providers
- Storage providers
- Database providers
- Queue providers
"""

from __future__ import annotations

from typing import Any

from app.core.logging import logger



class ProviderRegistry:
    """
    Central provider registry.

    Allows dynamic provider registration
    and dependency resolution.
    """

    def __init__(self) -> None:

        self._providers: dict[str, Any] = {}



    def register(
        self,
        name: str,
        provider: Any,
    ) -> None:
        """
        Register a provider.

        Example:
            register(
                "openai",
                OpenAIProvider()
            )
        """

        if name in self._providers:

            logger.warning(
                "Provider already exists: %s",
                name,
            )


        self._providers[name] = provider


        logger.info(
            "Provider registered: %s",
            name,
        )



    def get(
        self,
        name: str,
    ) -> Any:
        """
        Retrieve provider by name.
        """

        provider = self._providers.get(
            name,
        )


        if provider is None:

            raise KeyError(
                f"Provider not found: {name}"
            )


        return provider



    def exists(
        self,
        name: str,
    ) -> bool:
        """
        Check provider availability.
        """

        return name in self._providers



    def remove(
        self,
        name: str,
    ) -> None:
        """
        Remove provider.
        """

        if name in self._providers:

            del self._providers[name]


            logger.info(
                "Provider removed: %s",
                name,
            )



    def list(
        self,
    ) -> list[str]:
        """
        List all registered providers.
        """

        return list(
            self._providers.keys()
        )



    def clear(
        self,
    ) -> None:
        """
        Clear all providers.
        """

        self._providers.clear()


        logger.info(
            "All providers cleared.",
        )



    def get_all(
        self,
    ) -> dict[str, Any]:
        """
        Return all providers.
        """

        return self._providers.copy()



# Global provider registry instance

provider_registry = ProviderRegistry()