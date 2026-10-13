"""Common request and status schemas for ModelNow vector storage."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class VectorStoreConfig:
    backend: str
    collection_name: str
    dimension: int | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class SearchRequest:
    query_vector: list[float]
    top_k: int = 5
    filters: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class UpsertRequest:
    document_id: str
    text: str
    vector: list[float]
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class EngineStatus:
    initialized: bool
    backend: str
    healthy: bool | None = None
    message: str = ""


@dataclass
class SearchResponse:
    results: list[Any]
    count: int
    backend: str
