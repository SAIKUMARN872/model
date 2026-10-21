"""Lifecycle and coordination for embedding indexes."""

from collections.abc import Mapping, Sequence
from threading import RLock
from typing import Any

from .builder import EmbeddingIndexBuilder


class EmbeddingIndexManager:
    """Manage index creation, updates, deletion, and backend access."""

    def __init__(self, backend: Any):
        self.backend = backend
        self.builder = EmbeddingIndexBuilder(backend)
        self._lock = RLock()

    def build(self, ids, vectors, metadata=None):
        with self._lock:
            return self.builder.build(ids, vectors, metadata)

    def add(self, ids, vectors, metadata=None):
        with self._lock:
            return self.builder.build(ids, vectors, metadata)

    def delete(self, ids: Sequence[str]):
        if isinstance(ids, (str, bytes)) or not isinstance(ids, Sequence):
            raise TypeError("ids must be a sequence of strings")
        if any(not isinstance(item, str) or not item.strip() for item in ids):
            raise ValueError("IDs must be non-empty strings")

        method = getattr(self.backend, "delete", None)
        if not callable(method):
            method = getattr(self.backend, "delete_documents", None)
        if not callable(method):
            raise TypeError("Backend must implement delete or delete_documents")

        with self._lock:
            return method(list(ids))

    def search(self, vector, limit: int = 10, filters=None):
        if isinstance(limit, bool) or not isinstance(limit, int) or limit < 1:
            raise ValueError("limit must be a positive integer")

        method = getattr(self.backend, "search", None)
        if not callable(method):
            method = getattr(self.backend, "search_vectors", None)
        if not callable(method):
            raise TypeError("Backend must implement search or search_vectors")

        with self._lock:
            if filters is None:
                return method(vector, limit=limit)
            return method(vector, limit=limit, filters=filters)

    def close(self):
        method = getattr(self.backend, "close", None)
        if callable(method):
            method()
