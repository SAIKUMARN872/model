from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class BGERerankItem:
    index: int
    score: float
    text: str


@dataclass(frozen=True, slots=True)
class BGERerankResponse:
    model: str
    results: tuple[BGERerankItem, ...]
    request_id: str | None = None


@dataclass(frozen=True, slots=True)
class BGEModelInfo:
    id: str
    provider: str = "bge"
    description: str = "BGE cross-encoder reranker"
    max_documents: int = 512
