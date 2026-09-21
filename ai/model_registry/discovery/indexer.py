from __future__ import annotations

from collections.abc import Iterable

from ..models import ModelRecord
from .utils import group_by_provider, normalize_models


class ModelDiscoveryIndex:
    """
    Read-only index built from discovered ModelRecord objects.
    """

    def __init__(
        self,
        models: Iterable[ModelRecord] | None = None,
    ) -> None:
        self._models: dict[str, ModelRecord] = {}

        if models is not None:
            self.update(models)

    def update(
        self,
        models: Iterable[ModelRecord],
    ) -> None:
        normalized = normalize_models(models)

        self._models = {
            model.qualified_id.lower(): model
            for model in normalized
        }

    def add(
        self,
        model: ModelRecord,
    ) -> None:
        if not isinstance(model, ModelRecord):
            raise TypeError(
                "model must be a ModelRecord"
            )

        self._models[
            model.qualified_id.lower()
        ] = model

    def get(
        self,
        qualified_id: str,
    ) -> ModelRecord | None:
        return self._models.get(
            qualified_id.strip().lower()
        )

    def list_models(self) -> list[ModelRecord]:
        return list(self._models.values())

    def by_provider(
        self,
        provider: str,
    ) -> list[ModelRecord]:
        provider_value = provider.strip().lower()

        return [
            model
            for model in self._models.values()
            if model.provider.lower()
            == provider_value
        ]

    def providers(self) -> set[str]:
        return {
            model.provider
            for model in self._models.values()
        }

    def count(self) -> int:
        return len(self._models)

    def clear(self) -> None:
        self._models.clear()


__all__ = ["ModelDiscoveryIndex"]
