from __future__ import annotations

from collections.abc import Iterable

from ..interfaces import ModelSource
from ..models import ModelRecord
from .utils import normalize_models


class ModelScanner:
    """
    Scans one or more ModelSource implementations and returns
    normalized canonical ModelRecord objects.
    """

    def __init__(
        self,
        sources: Iterable[ModelSource] | None = None,
    ) -> None:
        self._sources: list[ModelSource] = list(
            sources or []
        )

    def add_source(
        self,
        source: ModelSource,
    ) -> None:
        if source not in self._sources:
            self._sources.append(source)

    def remove_source(
        self,
        provider: str,
    ) -> bool:
        provider_value = provider.strip().lower()

        original_count = len(self._sources)

        self._sources = [
            source
            for source in self._sources
            if source.provider.strip().lower()
            != provider_value
        ]

        return len(self._sources) < original_count

    def sources(self) -> list[ModelSource]:
        return list(self._sources)

    def scan_source(
        self,
        source: ModelSource,
    ) -> list[ModelRecord]:
        models = source.discover_models()

        return normalize_models(models)

    def scan(self) -> list[ModelRecord]:
        discovered: list[ModelRecord] = []

        for source in self._sources:
            discovered.extend(
                self.scan_source(source)
            )

        return normalize_models(discovered)


__all__ = ["ModelScanner"]
