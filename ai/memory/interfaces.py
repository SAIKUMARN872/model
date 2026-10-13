"""Structural interfaces for pluggable ModelNow memory backends."""

from __future__ import annotations

from typing import Protocol, runtime_checkable

from .models import MemoryQuery, MemoryRecord, MemorySearchResult


@runtime_checkable
class MemoryStore(Protocol):
    """Persistence contract. Implementations must enforce tenant scope."""

    def save(self, record: MemoryRecord) -> MemoryRecord:
        """Create or update a record using the implementation's version policy."""
        ...

    def get(self, tenant_id: str, memory_id: str) -> MemoryRecord | None:
        """Fetch a record within the requested tenant."""
        ...

    def delete(self, tenant_id: str, memory_id: str) -> bool:
        """Delete a record within the requested tenant."""
        ...

    def search(self, query: MemoryQuery) -> list[MemorySearchResult]:
        """Search only records visible within the query's tenant scope."""
        ...


@runtime_checkable
class MemoryCache(Protocol):
    """Optional cache contract with explicit expiration."""

    def get(self, key: str) -> bytes | None:
        ...

    def set(self, key: str, value: bytes, *, ttl_seconds: int) -> None:
        ...

    def delete(self, key: str) -> bool:
        ...


@runtime_checkable
class EmbeddingProvider(Protocol):
    """Minimal interface for semantic memory retrieval."""

    def embed_query(self, text: str) -> list[float]:
        ...

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        ...
