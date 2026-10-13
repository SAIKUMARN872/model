"""Lifecycle and access manager for embedding providers."""

from __future__ import annotations

import threading
from collections.abc import Mapping
from typing import Any

from .factory import EmbeddingProviderFactory
from .registry import EmbeddingProviderRegistry
from .utils import validate_name, validate_provider, validate_texts


class EmbeddingManager:
    def __init__(
        self,
        registry: EmbeddingProviderRegistry | None = None,
        factory: EmbeddingProviderFactory | None = None,
    ) -> None:
        if factory is not None and registry is not None and factory.registry is not registry:
            raise ValueError("factory and registry must refer to the same registry")
        self.registry = registry or (
            factory.registry if factory is not None else EmbeddingProviderRegistry()
        )
        self.factory = factory or EmbeddingProviderFactory(self.registry)
        self._providers: dict[str, Any] = {}
        self._lock = threading.RLock()
        self._closed = False

    def register_factory(self, name: str, factory: Any, *, replace: bool = False) -> None:
        with self._lock:
            self._ensure_open()
            self.registry.register(name, factory, replace=replace)

    def add_provider(self, name: str, provider: Any, *, replace: bool = False) -> None:
        key = validate_name(name, "name").lower()
        validate_provider(provider)
        with self._lock:
            self._ensure_open()
            if key in self._providers and not replace:
                raise ValueError(f"Provider instance '{key}' already exists")
            previous = self._providers.get(key)
            self._providers[key] = provider
        if previous is not None and previous is not provider:
            self._close_provider(previous)

    def create_provider(
        self,
        name: str,
        provider_type: str,
        config: Mapping[str, Any] | None = None,
        *,
        replace: bool = False,
        **overrides: Any,
    ) -> Any:
        key = validate_name(name, "name").lower()
        with self._lock:
            self._ensure_open()
            if key in self._providers and not replace:
                raise ValueError(f"Provider instance '{key}' already exists")

        provider = self.factory.create(provider_type, config, **overrides)
        try:
            self.add_provider(key, provider, replace=replace)
        except Exception:
            self._close_provider(provider)
            raise
        return provider

    def get_provider(self, name: str) -> Any:
        key = validate_name(name, "name").lower()
        with self._lock:
            self._ensure_open()
            try:
                return self._providers[key]
            except KeyError as exc:
                raise KeyError(f"No provider instance registered as '{key}'") from exc

    def embed_texts(self, name: str, texts: Any, **kwargs: Any) -> list[list[float]]:
        validated = validate_texts(texts)
        if not validated:
            return []
        provider = self.get_provider(name)
        result = provider.embed_texts(validated, **kwargs)
        if len(result) != len(validated):
            raise ValueError(
                f"Provider returned {len(result)} vectors for {len(validated)} texts"
            )
        return result

    def embed_query(self, name: str, query: str) -> list[float]:
        if not isinstance(query, str):
            raise TypeError("query must be a string")
        if not query.strip():
            raise ValueError("query must not be empty")
        provider = self.get_provider(name)
        method = getattr(provider, "embed_query", None)
        if callable(method):
            return method(query.strip())
        return self.embed_texts(name, [query.strip()])[0]

    def remove_provider(self, name: str, *, close: bool = True) -> bool:
        key = validate_name(name, "name").lower()
        with self._lock:
            self._ensure_open()
            provider = self._providers.pop(key, None)
        if provider is None:
            return False
        if close:
            self._close_provider(provider)
        return True

    def provider_names(self) -> tuple[str, ...]:
        with self._lock:
            self._ensure_open()
            return tuple(sorted(self._providers))

    def close(self) -> None:
        with self._lock:
            if self._closed:
                return
            self._closed = True
            providers = list(self._providers.values())
            self._providers.clear()

        errors = []
        for provider in providers:
            try:
                self._close_provider(provider)
            except Exception as exc:
                errors.append(exc)
        if errors:
            raise RuntimeError(
                f"Failed to close {len(errors)} embedding provider(s)"
            ) from errors[0]

    def _ensure_open(self) -> None:
        if self._closed:
            raise RuntimeError("EmbeddingManager is closed")

    @staticmethod
    def _close_provider(provider: Any) -> None:
        close = getattr(provider, "close", None)
        if callable(close):
            close()

    def __enter__(self) -> "EmbeddingManager":
        with self._lock:
            self._ensure_open()
        return self

    def __exit__(self, exc_type: Any, exc_value: Any, traceback: Any) -> None:
        self.close()
