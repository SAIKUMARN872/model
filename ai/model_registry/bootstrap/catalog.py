from __future__ import annotations

from ai.model_registry.engine import ModelRegistryEngine

from .defaults import default_models


def bootstrap_registry(
    registry: ModelRegistryEngine | None = None,
) -> ModelRegistryEngine:
    if registry is None:
        registry = ModelRegistryEngine()

    for model in default_models():
        existing = registry.get(
            model.provider,
            model.model_id,
        )

        if existing is None:
            registry.register(model)

    return registry


__all__ = ["bootstrap_registry"]