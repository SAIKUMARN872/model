from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class MixedbreadRerankItem:
    index: int
    relevance_score: float
    text: str


@dataclass(frozen=True, slots=True)
class MixedbreadRerankResponse:
    model: str
    results: tuple[MixedbreadRerankItem, ...]
    request_id: str | None = None


@dataclass(frozen=True, slots=True)
class MixedbreadRerankerModelInfo:
    id: str
    provider: str = "mixedbread"
    description: str = "Mixedbread reranking model"
    max_documents: int = 1000
