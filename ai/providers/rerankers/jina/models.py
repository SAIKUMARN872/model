from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class JinaRerankItem:
    index: int
    relevance_score: float
    text: str


@dataclass(frozen=True, slots=True)
class JinaRerankResponse:
    model: str
    results: tuple[JinaRerankItem, ...]
    request_id: str | None = None


@dataclass(frozen=True, slots=True)
class JinaRerankerModelInfo:
    id: str
    provider: str = "jina"
    description: str = "Jina reranking model"
    max_documents: int = 1000
