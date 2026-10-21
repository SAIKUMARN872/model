from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class CohereRerankItem:
    index: int
    relevance_score: float
    text: str


@dataclass(frozen=True, slots=True)
class CohereRerankResponse:
    model: str
    results: tuple[CohereRerankItem, ...]
    request_id: str | None = None


@dataclass(frozen=True, slots=True)
class CohereRerankerModelInfo:
    id: str
    provider: str = "cohere"
    description: str = (
        "Cohere hosted reranking model"
    )
    max_documents: int = 1000
