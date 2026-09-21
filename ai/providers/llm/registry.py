from __future__ import annotations

from threading import RLock
from typing import Dict, List, Optional, Type

from ..base.provider import BaseProvider


class LLMRegistryError(Exception):
    """Base LLM registry error."""


class LLMProviderAlreadyRegisteredError(
    LLMRegistryError
):
    """Raised when an LLM provider is registered twice."""


class LLMProviderNotFoundError(
    LLMRegistryError
):
    """Raised when an LLM provider cannot be found."""


class LLMRegistry:
    """
    Runtime registry for concrete LLM provider implementations.

    Examples:

        openai
        anthropic
        google
        deepseek
        mistral
        xai
        cohere
        openrouter
        aws_bedrock
        azure_openai

    This registry stores implementations.

    It does NOT decide:
        - which model to use
        - cheapest model
        - fastest model
        - highest quality model

    Those decisions belong to ModelNow routing/optimization.
    """

    def __init__(self) -> None:

        self._providers: Dict[
            str,
            Type[BaseProvider],
        ] = {}

        self._lock = RLock()

    # --------------------------------------------------------------
    # Registration
    # --------------------------------------------------------------

    def register(
        self,
        provider_id: str,
        provider_class: Type[BaseProvider],
        *,
        overwrite: bool = False,
    ) -> None:

        if not provider_id:
            raise ValueError(
                "provider_id cannot be empty."
            )

        if not issubclass(
            provider_class,
            BaseProvider,
        ):
            raise TypeError(
                f"{provider_class.__name__} must "
                "inherit from BaseProvider."
            )

        with self._lock:

            if (
                provider_id in self._providers
                and not overwrite
            ):
                raise LLMProviderAlreadyRegisteredError(
                    f"LLM provider '{provider_id}' "
                    "is already registered."
                )

            self._providers[
                provider_id
            ] = provider_class

    def register_many(
        self,
        providers: Dict[
            str,
            Type[BaseProvider],
        ],
        *,
        overwrite: bool = False,
    ) -> int:

        count = 0

        for provider_id, provider_class in (
            providers.items()
        ):

            self.register(
                provider_id,
                provider_class,
                overwrite=overwrite,
            )

            count += 1

        return count

    # --------------------------------------------------------------
    # Lookup
    # --------------------------------------------------------------

    def get(
        self,
        provider_id: str,
    ) -> Optional[
        Type[BaseProvider]
    ]:

        with self._lock:
            return self._providers.get(
                provider_id
            )

    def require(
        self,
        provider_id: str,
    ) -> Type[BaseProvider]:

        provider = self.get(
            provider_id
        )

        if provider is None:
            raise LLMProviderNotFoundError(
                f"LLM provider '{provider_id}' "
                "is not registered."
            )

        return provider

    def exists(
        self,
        provider_id: str,
    ) -> bool:

        with self._lock:
            return provider_id in self._providers

    # --------------------------------------------------------------
    # Discovery
    # --------------------------------------------------------------

    def all(
        self,
    ) -> Dict[
        str,
        Type[BaseProvider],
    ]:

        with self._lock:
            return dict(
                self._providers
            )

    def ids(
        self,
    ) -> List[str]:

        with self._lock:
            return sorted(
                self._providers.keys()
            )

    def count(
        self,
    ) -> int:

        with self._lock:
            return len(
                self._providers
            )

    # --------------------------------------------------------------
    # Lifecycle
    # --------------------------------------------------------------

    def remove(
        self,
        provider_id: str,
    ) -> None:

        with self._lock:

            if provider_id not in self._providers:
                raise LLMProviderNotFoundError(
                    f"LLM provider '{provider_id}' "
                    "is not registered."
                )

            del self._providers[
                provider_id
            ]

    def clear(
        self,
    ) -> None:

        with self._lock:
            self._providers.clear()

