from __future__ import annotations

from collections.abc import Iterable

from .models import ModelRecord
from .registry.manager import ModelRegistryManager


class ModelRegistryEngine:
    """
    High-level orchestration layer for the ModelNow model registry.

    The engine coordinates model registration, lookup, discovery,
    and removal through the underlying registry manager.
    """

    def __init__(
        self,
        manager: ModelRegistryManager | None = None,
    ) -> None:
        self.manager = (
            manager
            if manager is not None
            else ModelRegistryManager()
        )

    def register(
        self,
        model: ModelRecord,
    ) -> ModelRecord:
        return self.manager.register(model)

    def register_many(
        self,
        models: Iterable[ModelRecord],
    ) -> list[ModelRecord]:
        registered: list[ModelRecord] = []

        for model in models:
            registered.append(
                self.register(model)
            )

        return registered

    def get(
        self,
        provider: str,
        model_id: str,
    ) -> ModelRecord | None:
        return self.manager.get(
            provider,
            model_id,
        )

    def get_by_id(
        self,
        qualified_id: str,
    ) -> ModelRecord | None:
        return self.manager.get_by_id(
            qualified_id
        )

    def find(
        self,
        model_name: str,
    ) -> list[ModelRecord]:
        return self.manager.find(
            model_name
        )

    def list_models(self) -> list[ModelRecord]:
        return self.manager.list_models()

    def remove(
        self,
        provider: str,
        model_id: str,
    ) -> ModelRecord | None:
        return self.manager.remove(
            provider,
            model_id,
        )

    def clear(self) -> None:
        self.manager.clear()

    def count(self) -> int:
        return self.manager.count()

    def providers(self) -> list[str]:
        return self.manager.providers()


__all__ = [
    "ModelRegistryEngine",
]
