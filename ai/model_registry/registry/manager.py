from __future__ import annotations

from typing import Iterable

from ..models import ModelRecord


class ModelRegistryManager:
    """
    In-memory canonical registry for ModelNow models.

    Provider adapters publish normalized ModelRecord objects into
    this registry. Routing and catalog components consume them.
    """

    def __init__(
        self,
        models: Iterable[ModelRecord] | None = None,
    ) -> None:
        self._models: dict[str, ModelRecord] = {}

        if models:
            for model in models:
                self.register(model)

    def register(self, model: ModelRecord) -> ModelRecord:
        if not isinstance(model, ModelRecord):
            raise TypeError("model must be a ModelRecord")

        key = model.qualified_id.lower()

        if key in self._models:
            raise ValueError(
                f"Model already registered: {model.qualified_id}"
            )

        self._models[key] = model
        return model

    def upsert(self, model: ModelRecord) -> ModelRecord:
        if not isinstance(model, ModelRecord):
            raise TypeError("model must be a ModelRecord")

        self._models[model.qualified_id.lower()] = model
        return model

    def get(
        self,
        provider: str,
        model_id: str,
    ) -> ModelRecord | None:
        key = f"{provider}:{model_id}".lower()
        return self._models.get(key)

    def get_by_id(
        self,
        qualified_id: str,
    ) -> ModelRecord | None:
        return self._models.get(
            qualified_id.strip().lower()
        )

    def find(self, model_name: str) -> list[ModelRecord]:
        value = model_name.strip().lower()

        return [
            model
            for model in self._models.values()
            if model.matches(value)
        ]

    def list_models(
        self,
        *,
        provider: str | None = None,
        enabled_only: bool = False,
        available_only: bool = False,
    ) -> list[ModelRecord]:
        models = list(self._models.values())

        if provider is not None:
            provider_value = provider.strip().lower()
            models = [
                model
                for model in models
                if model.provider.lower() == provider_value
            ]

        if enabled_only:
            models = [
                model
                for model in models
                if model.enabled
            ]

        if available_only:
            models = [
                model
                for model in models
                if model.available
            ]

        return models

    def remove(
        self,
        provider: str,
        model_id: str,
    ) -> ModelRecord | None:
        key = f"{provider}:{model_id}".lower()
        return self._models.pop(key, None)

    def clear(self) -> None:
        self._models.clear()

    def count(self) -> int:
        return len(self._models)

    def providers(self) -> set[str]:
        return {
            model.provider
            for model in self._models.values()
        }


__all__ = ["ModelRegistryManager"]
