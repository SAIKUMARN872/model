"""Central lifecycle manager for ModelNow vector stores."""

from __future__ import annotations

from typing import Any

from ai.vector_store.manager.factory import VectorStoreFactory
from ai.vector_store.manager.registry import VectorStoreRegistry
from ai.vector_store.manager.utils import (
    validate_backend_name,
    validate_store_name,
)


class VectorStoreManager:
    """Create, register, retrieve, and remove vector-store instances."""

    def __init__(
        self,
        factory: VectorStoreFactory | None = None,
        registry: VectorStoreRegistry | None = None,
    ) -> None:
        self.factory = factory or VectorStoreFactory()
        self.registry = registry or VectorStoreRegistry()
        self._backend_names: dict[str, str] = {}

    def register_backend(
        self,
        backend_name: str,
        constructor: Any,
        *,
        replace: bool = False,
    ) -> None:
        self.factory.register(
            backend_name,
            constructor,
            replace=replace,
        )

    def create_store(
        self,
        store_name: str,
        backend_name: str,
        *,
        replace: bool = False,
        **backend_options: Any,
    ) -> Any:
        store_name = validate_store_name(store_name)
        backend_name = validate_backend_name(backend_name)

        if self.registry.contains(store_name) and not replace:
            raise ValueError(f"Store {store_name!r} is already registered")

        instance = self.factory.create(backend_name, **backend_options)
        self.registry.register(store_name, instance, replace=replace)
        self._backend_names[store_name] = backend_name
        return instance

    def register_store(
        self,
        store_name: str,
        store: Any,
        *,
        backend_name: str | None = None,
        replace: bool = False,
    ) -> Any:
        store_name = validate_store_name(store_name)

        if self.registry.contains(store_name) and not replace:
            raise ValueError(f"Store {store_name!r} is already registered")

        if backend_name is not None:
            backend_name = validate_backend_name(backend_name)

        instance = self.registry.register(
            store_name,
            store,
            replace=replace,
        )

        if backend_name is not None:
            self._backend_names[store_name] = backend_name
        else:
            self._backend_names.pop(store_name, None)

        return instance

    def get_store(self, store_name: str) -> Any:
        return self.registry.get(store_name)

    def get_backend_name(self, store_name: str) -> str | None:
        store_name = validate_store_name(store_name)
        self.registry.get(store_name)
        return self._backend_names.get(store_name)

    def list_stores(self) -> list[dict[str, str | None]]:
        return [
            {
                "name": name,
                "backend": self._backend_names.get(name),
            }
            for name in self.registry.list_names()
        ]

    def remove_store(self, store_name: str) -> Any:
        store_name = validate_store_name(store_name)
        instance = self.registry.remove(store_name)
        self._backend_names.pop(store_name, None)
        return instance

    def clear_registry(self) -> None:
        """Unregister all stores without deleting their persisted data."""
        self.registry.clear()
        self._backend_names.clear()
