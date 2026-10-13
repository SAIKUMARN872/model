"""Registry for named vector-store instances."""

from __future__ import annotations

from typing import Any

from ai.vector_store.manager.utils import validate_store_name


class VectorStoreRegistry:
    def __init__(self) -> None:
        self._stores: dict[str, Any] = {}

    def register(
        self,
        name: str,
        store: Any,
        *,
        replace: bool = False,
    ) -> Any:
        name = validate_store_name(name)

        if store is None:
            raise ValueError("Cannot register a null vector store")

        if name in self._stores and not replace:
            raise ValueError(f"Store {name!r} is already registered")

        self._stores[name] = store
        return store

    def get(self, name: str) -> Any:
        name = validate_store_name(name)

        try:
            return self._stores[name]
        except KeyError as exc:
            raise LookupError(f"Vector store {name!r} is not registered") from exc

    def remove(self, name: str) -> Any:
        name = validate_store_name(name)

        try:
            return self._stores.pop(name)
        except KeyError as exc:
            raise LookupError(f"Vector store {name!r} is not registered") from exc

    def contains(self, name: str) -> bool:
        return validate_store_name(name) in self._stores

    def list_names(self) -> tuple[str, ...]:
        return tuple(sorted(self._stores))

    def clear(self) -> None:
        self._stores.clear()

    def __len__(self) -> int:
        return len(self._stores)
