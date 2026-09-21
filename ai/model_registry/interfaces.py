from __future__ import annotations

from typing import Iterable, Protocol

from .models import ModelRecord


class ModelRegistry(Protocol):
    """
    Contract implemented by the canonical ModelNow model registry.
    """

    def register(self, model: ModelRecord) -> ModelRecord:
        ...

    def upsert(self, model: ModelRecord) -> ModelRecord:
        ...

    def get(
        self,
        provider: str,
        model_id: str,
    ) -> ModelRecord | None:
        ...

    def get_by_id(
        self,
        qualified_id: str,
    ) -> ModelRecord | None:
        ...

    def find(
        self,
        model_name: str,
    ) -> list[ModelRecord]:
        ...

    def list_models(
        self,
        *,
        provider: str | None = None,
        enabled_only: bool = False,
        available_only: bool = False,
    ) -> list[ModelRecord]:
        ...

    def remove(
        self,
        provider: str,
        model_id: str,
    ) -> ModelRecord | None:
        ...

    def clear(self) -> None:
        ...

    def count(self) -> int:
        ...

    def providers(self) -> set[str]:
        ...


class ModelSource(Protocol):
    """
    Contract for provider adapters or discovery systems that
    supply normalized models to the canonical registry.
    """

    @property
    def provider(self) -> str:
        ...

    def discover_models(self) -> Iterable[ModelRecord]:
        ...


class ModelRegistryValidator(Protocol):
    """
    Contract for validating canonical ModelRecord objects.
    """

    def validate(
        self,
        model: ModelRecord,
    ) -> None:
        ...


__all__ = [
    "ModelRegistry",
    "ModelSource",
    "ModelRegistryValidator",
]
