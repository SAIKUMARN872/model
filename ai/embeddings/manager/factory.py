"""Factory for creating embedding providers from a registry."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from .registry import EmbeddingProviderRegistry
from .utils import validate_name, validate_provider, validate_provider_config


class EmbeddingProviderFactory:
    def __init__(self, registry: EmbeddingProviderRegistry | None = None) -> None:
        self.registry = registry if registry is not None else EmbeddingProviderRegistry()

    def create(
        self,
        name: str,
        config: Mapping[str, Any] | None = None,
        **overrides: Any,
    ) -> Any:
        provider_name = validate_name(name, "name").lower()
        options = validate_provider_config(config)
        overlap = options.keys() & overrides.keys()
        if overlap:
            raise ValueError(
                "Configuration keys supplied twice: " + ", ".join(sorted(overlap))
            )
        options.update(overrides)
        factory = self.registry.get(provider_name)
        try:
            provider = factory(**options)
        except Exception as exc:
            raise RuntimeError(
                f"Failed to create embedding provider '{provider_name}': {exc}"
            ) from exc
        try:
            return validate_provider(provider)
        except (TypeError, ValueError) as exc:
            close = getattr(provider, "close", None)
            if callable(close):
                close()
            raise RuntimeError(
                f"Factory '{provider_name}' returned an invalid provider: {exc}"
            ) from exc

