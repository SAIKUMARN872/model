from __future__ import annotations

import threading
from typing import Protocol, Sequence, runtime_checkable

from ai.memory.manager.utils import (
    MemoryContext,
    MemoryItem,
    validate_id,
    validate_limit,
    validate_text,
)


@runtime_checkable
class MemoryBackend(Protocol):
    """Contract that a memory backend adapter must implement."""

    name: str

    def write(
        self, context: MemoryContext, content: str, *,
        category: str, metadata: dict,
    ) -> str: ...

    def search(
        self, context: MemoryContext, query: str, *,
        limit: int, category: str | None = None,
    ) -> Sequence[MemoryItem]: ...

    def delete(self, context: MemoryContext, memory_id: str) -> bool: ...


class MemoryManager:
    """Coordinates explicitly registered memory backends."""

    def __init__(self, backends: Sequence[MemoryBackend] = ()) -> None:
        self._lock = threading.RLock()
        self._backends: dict[str, MemoryBackend] = {}
        for backend in backends:
            self.register_backend(backend)

    def register_backend(self, backend: MemoryBackend) -> None:
        if not isinstance(getattr(backend, "name", None), str):
            raise ValueError("backend must provide a string name")
        name = validate_id(backend.name, "backend.name")
        for method in ("write", "search", "delete"):
            if not callable(getattr(backend, method, None)):
                raise ValueError(f"backend {name!r} must implement {method}()")
        with self._lock:
            if name in self._backends:
                raise ValueError(f"backend {name!r} is already registered")
            self._backends[name] = backend

    def unregister_backend(self, name: str) -> bool:
        name = validate_id(name, "backend")
        with self._lock:
            return self._backends.pop(name, None) is not None

    def backend_names(self) -> tuple[str, ...]:
        with self._lock:
            return tuple(sorted(self._backends))

    def _snapshot(self, names: Sequence[str] | None = None) -> list[MemoryBackend]:
        with self._lock:
            if names is None:
                return [self._backends[key] for key in sorted(self._backends)]
            requested = [validate_id(name, "backend") for name in names]
            if len(set(requested)) != len(requested):
                raise ValueError("backend names must not contain duplicates")
            missing = [name for name in requested if name not in self._backends]
            if missing:
                raise ValueError(f"unknown backend(s): {', '.join(missing)}")
            return [self._backends[name] for name in requested]

    def remember(
        self,
        context: MemoryContext,
        content: str,
        *,
        category: str = "general",
        metadata: dict | None = None,
        backends: Sequence[str] | None = None,
    ) -> dict[str, str]:
        if not isinstance(context, MemoryContext):
            raise ValueError("context must be a MemoryContext")
        content = validate_text(content, "content")
        category = validate_id(category, "category")
        from ai.memory.manager.utils import validate_json_mapping
        safe_metadata = validate_json_mapping(metadata)
        selected = self._snapshot(backends)
        if not selected:
            raise RuntimeError("no memory backends are registered")

        successes: dict[str, str] = {}
        failures: list[str] = []
        for backend in selected:
            try:
                memory_id = backend.write(
                    context, content, category=category, metadata=safe_metadata
                )
                successes[backend.name] = validate_id(memory_id, "memory_id")
            except Exception as exc:
                # The caller receives a partial-success summary, not raw exception
                # details that could include secrets.
                failures.append(f"{backend.name}: {type(exc).__name__}")

        if failures and not successes:
            raise RuntimeError("all memory writes failed: " + ", ".join(failures))
        if failures:
            successes["_partial_failures"] = ", ".join(failures)
        return successes

    def recall(
        self,
        context: MemoryContext,
        query: str,
        *,
        limit: int = 10,
        category: str | None = None,
        backends: Sequence[str] | None = None,
    ) -> list[MemoryItem]:
        if not isinstance(context, MemoryContext):
            raise ValueError("context must be a MemoryContext")
        query = validate_text(query, "query")
        limit = validate_limit(limit, maximum=100)
        if category is not None:
            category = validate_id(category, "category")
        selected = self._snapshot(backends)
        results: list[MemoryItem] = []
        failures: list[str] = []

        for backend in selected:
            try:
                items = backend.search(
                    context, query, limit=limit, category=category
                )
                for item in items:
                    if not isinstance(item, MemoryItem):
                        raise TypeError(
                            f"{backend.name} returned a non-MemoryItem result"
                        )
                    if item.backend != backend.name:
                        raise ValueError(
                            f"{backend.name} returned an item with a mismatched backend"
                        )
                    results.append(item)
            except Exception as exc:
                failures.append(f"{backend.name}: {type(exc).__name__}")

        if failures and not results:
            raise RuntimeError("all memory searches failed: " + ", ".join(failures))

        results.sort(
            key=lambda item: (item.score, item.created_at, item.memory_id),
            reverse=True,
        )
        return results[:limit]

    def forget(
        self,
        context: MemoryContext,
        memory_id: str,
        *,
        backend: str,
    ) -> bool:
        if not isinstance(context, MemoryContext):
            raise ValueError("context must be a MemoryContext")
        memory_id = validate_id(memory_id, "memory_id")
        selected = self._snapshot([backend])
        return selected[0].delete(context, memory_id)
