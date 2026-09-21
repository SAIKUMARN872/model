from __future__ import annotations

from typing import Type

from ..base.provider import BaseProvider
from ..constants import ProviderStatus
from ..models import ProviderMetadata

from .registry import LLMRegistry


class LLMSelectionError(Exception):
    """Raised when an LLM implementation cannot be selected."""


class LLMSelector:
    """
    Resolves concrete LLM provider implementations.

    Important:

        LLMSelector != ModelNow Routing Engine.

    The selector answers:

        "Which implementation represents OpenAI?"

    The routing engine answers:

        "Which model should ModelNow use for this request?"
    """

    def __init__(
        self,
        registry: LLMRegistry,
    ) -> None:

        self.registry = registry

    def select(
        self,
        provider_id: str,
    ) -> Type[BaseProvider]:

        provider_class = self.registry.get(
            provider_id
        )

        if provider_class is None:
            raise LLMSelectionError(
                f"LLM provider '{provider_id}' "
                "is not registered."
            )

        return provider_class

    def instantiate(
        self,
        provider_id: str,
        **kwargs,
    ) -> BaseProvider:

        provider_class = self.select(
            provider_id
        )

        return provider_class(
            **kwargs
        )

    def can_select(
        self,
        provider_id: str,
    ) -> bool:

        return self.registry.exists(
            provider_id
        )

