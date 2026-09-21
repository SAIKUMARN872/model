from __future__ import annotations

from collections.abc import Iterable

from ..models import ModelRecord
from .indexer import ModelDiscoveryIndex
from .scanner import ModelScanner
from .utils import normalize_models


class ModelDiscovery:
    """
    High-level discovery service.

    Scans registered provider sources, normalizes their models,
    and maintains a discovery index.
    """

    def __init__(
        self,
        scanner: ModelScanner,
        index: ModelDiscoveryIndex | None = None,
    ) -> None:
        self.scanner = scanner
        self.index = index or ModelDiscoveryIndex()

    def discover(self) -> list[ModelRecord]:
        models = self.scanner.scan()

        self.index.update(models)

        return models

    def refresh(self) -> list[ModelRecord]:
        return self.discover()

    def get(
        self,
        qualified_id: str,
    ) -> ModelRecord | None:
        return self.index.get(qualified_id)

    def list_models(self) -> list[ModelRecord]:
        return self.index.list_models()

    def by_provider(
        self,
        provider: str,
    ) -> list[ModelRecord]:
        return self.index.by_provider(provider)

    def count(self) -> int:
        return self.index.count()


__all__ = ["ModelDiscovery"]
