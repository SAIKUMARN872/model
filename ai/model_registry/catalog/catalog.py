from __future__ import annotations

from ..models import ModelRecord
from ..registry.manager import ModelRegistryManager
from ..schemas import ModelQuery
from .filter import filter_models
from .search import exact_match, search_models
from .utils import (
    sort_by_input_cost,
    sort_by_latency,
    sort_by_output_cost,
    sort_by_quality,
    unique_models,
)


class ModelCatalog:
    """
    Read-oriented catalog over the canonical ModelNow registry.

    The catalog does not own model registration. It queries the
    registry and provides search, filtering, and sorting operations
    consumed by routing and discovery components.
    """

    def __init__(
        self,
        registry: ModelRegistryManager,
    ) -> None:
        self.registry = registry

    def all(
        self,
        *,
        enabled_only: bool = False,
        available_only: bool = False,
    ) -> list[ModelRecord]:
        return self.registry.list_models(
            enabled_only=enabled_only,
            available_only=available_only,
        )

    def search(
        self,
        query: str,
    ) -> list[ModelRecord]:
        return search_models(
            self.all(),
            query,
        )

    def find_exact(
        self,
        query: str,
    ) -> ModelRecord | None:
        return exact_match(
            self.all(),
            query,
        )

    def filter(
        self,
        query: ModelQuery,
    ) -> list[ModelRecord]:
        return filter_models(
            self.all(),
            query,
        )

    def by_provider(
        self,
        provider: str,
    ) -> list[ModelRecord]:
        return self.registry.list_models(
            provider=provider,
        )

    def by_quality(
        self,
        models: list[ModelRecord] | None = None,
    ) -> list[ModelRecord]:
        return sort_by_quality(
            models if models is not None else self.all()
        )

    def by_latency(
        self,
        models: list[ModelRecord] | None = None,
    ) -> list[ModelRecord]:
        return sort_by_latency(
            models if models is not None else self.all()
        )

    def by_input_cost(
        self,
        models: list[ModelRecord] | None = None,
    ) -> list[ModelRecord]:
        return sort_by_input_cost(
            models if models is not None else self.all()
        )

    def by_output_cost(
        self,
        models: list[ModelRecord] | None = None,
    ) -> list[ModelRecord]:
        return sort_by_output_cost(
            models if models is not None else self.all()
        )

    def deduplicate(
        self,
        models: list[ModelRecord],
    ) -> list[ModelRecord]:
        return unique_models(models)


__all__ = ["ModelCatalog"]
