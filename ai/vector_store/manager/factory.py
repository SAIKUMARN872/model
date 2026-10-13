"""Factory for constructing registered ModelNow vector-store backends."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from ai.vector_store.manager.utils import validate_backend_name


BackendConstructor = Callable[..., Any]


class VectorStoreFactory:
    def __init__(self) -> None:
        self._constructors: dict[str, BackendConstructor] = {}

    def register(
        self,
        name: str,
        constructor: BackendConstructor,
        *,
        replace: bool = False,
    ) -> None:
        name = validate_backend_name(name)

        if not callable(constructor):
            raise TypeError("Backend constructor must be callable")

        if name in self._constructors and not replace:
            raise ValueError(f"Backend {name!r} is already registered")

        self._constructors[name] = constructor

    def create(self, name: str, **kwargs: Any) -> Any:
        name = validate_backend_name(name)

        constructor = self._constructors.get(name)
        if constructor is None:
            raise LookupError(f"No constructor registered for backend {name!r}")

        return constructor(**kwargs)

    def registered_backends(self) -> tuple[str, ...]:
        return tuple(sorted(self._constructors))
