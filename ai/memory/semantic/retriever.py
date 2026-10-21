from __future__ import annotations

import math
from dataclasses import dataclass

from ai.memory.semantic.knowledge import SemanticKnowledge
from ai.memory.semantic.memory import SemanticMemory
from ai.memory.semantic.utils import (
    lexical_tokens,
    validate_identifier,
    validate_text,
)


@dataclass(frozen=True, slots=True)
class SemanticSearchResult:
    knowledge: SemanticKnowledge
    score: float
    lexical_relevance: float
    confidence: float

    def __post_init__(self) -> None:
        for name in ("score", "lexical_relevance", "confidence"):
            value = getattr(self, name)
            if isinstance(value, bool) or not isinstance(value, (int, float)):
                raise ValueError(f"{name} must be numeric")
            if not math.isfinite(float(value)) or not 0 <= value <= 1:
                raise ValueError(f"{name} must be between 0 and 1")


class SemanticRetriever:
    def __init__(self, memory: SemanticMemory) -> None:
        if not isinstance(memory, SemanticMemory):
            raise ValueError("memory must be a SemanticMemory")
        self.memory = memory

    def search(
        self,
        tenant_id: str,
        user_id: str,
        query: str,
        *,
        limit: int = 10,
        category: str | None = None,
        min_score: float = 0.0,
    ) -> list[SemanticSearchResult]:
        tenant_id = validate_identifier(tenant_id, "tenant_id")
        user_id = validate_identifier(user_id, "user_id")
        query = validate_text(query, "query")
        if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= 100:
            raise ValueError("limit must be an integer between 1 and 100")
        if isinstance(min_score, bool) or not isinstance(min_score, (int, float)):
            raise ValueError("min_score must be numeric")
        min_score = float(min_score)
        if not math.isfinite(min_score) or not 0 <= min_score <= 1:
            raise ValueError("min_score must be between 0 and 1")
        if category is not None:
            category = validate_identifier(category, "category")

        query_tokens = lexical_tokens(query)
        records = self.memory.list(
            tenant_id, user_id, category=category, include_archived=False, limit=1000
        )
        results: list[SemanticSearchResult] = []

        for record in records:
            content_tokens = lexical_tokens(record.content)
            if not query_tokens:
                relevance = 0.0
            else:
                relevance = len(query_tokens & content_tokens) / len(query_tokens)
            score = min(1.0, 0.8 * relevance + 0.2 * record.confidence)
            if score >= min_score:
                results.append(
                    SemanticSearchResult(
                        knowledge=record,
                        score=score,
                        lexical_relevance=relevance,
                        confidence=record.confidence,
                    )
                )

        results.sort(
            key=lambda result: (
                result.score,
                result.knowledge.updated_at,
                result.knowledge.knowledge_id,
            ),
            reverse=True,
        )
        return results[:limit]
