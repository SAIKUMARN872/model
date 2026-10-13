"""Thread-safe registry for embedding provider factories."""

from __future__ import annotations

import threading
from collections.abc import Callable
from typing import Any

from .utils import validate_name


ProviderFactory = Callable[..., Any]


class EmbeddingProviderRegistry:
    def __init__(self) -> None:
        self._factories: dict[str, ProviderFactory] = {}
        self._lock = threading.RLock()

    def register(
        self,
        name: str,
        factory: ProviderFactory,
        *,
        replace: bool = False,
    ) -> None:
        key = validate_name(name, "name").lower()
        if not callable(factory):
            raise TypeError("factory must be callable")

        with self._lock:
            if key in self._factories and not replace:
                raise ValueError(f"Provider '{key}' is already registered")
            self._factories[key] = factory

    def unregister(self, name: str) -> bool:
        key = validate_name(name, "name").lower()
        with self._lock:
            return self._factories.pop(key, None) is not None

    def get(self, name: str) -> ProviderFactory:
        key = validate_name(name, "name").lower()
        with self._lock:
            try:
                return self._factories[key]
            except KeyError as exc:
                raise KeyError(f"Unknown embedding provider: '{key}'") from exc

    def contains(self, name: str) -> bool:
        key = validate_name(name, "name").lower()
        with self._lock:
            return key in self._factories

    def names(self) -> tuple[str, ...]:
        with self._lock:
            return tuple(sorted(self._factories))

    def clear(self) -> None:
        with self._lock:
            self._factories.clear()

    def __len__(self) -> int:
        with self._lock:
            return len(self._factories)
