from __future__ import annotations

import math
import re
from dataclasses import dataclass
from datetime import datetime, timezone

from ai.memory.long_term.storage import LongTermMemoryStore
from ai.memory.long_term.utils import LongTermMemoryRecord, validate_identifier


_WORD_RE = re.compile(r"[a-zA-Z0-9_]{2,}")


def _tokens(value: str) -> set[str]:
    return {token.casefold() for token in _WORD_RE.findall(value)}


@dataclass(frozen=True, slots=True)
class LongTermSearchResult:
    record: LongTermMemoryRecord
    score: float
    relevance: float
    importance: float
    recency: float

    def __post_init__(self) -> None:
        for name in ("score", "relevance", "importance", "recency"):
            value = getattr(self, name)
            if isinstance(value, bool) or not isinstance(value, (int, float)):
                raise ValueError(f"{name} must be numeric")
            if not math.isfinite(value) or not 0.0 <= value <= 1.0:
                raise ValueError(f"{name} must be finite and between 0 and 1")


class LongTermMemoryRetriever:
    def __init__(self, store: LongTermMemoryStore) -> None:
        self.store = store

    def retrieve(
        self,
        tenant_id: str,
        user_id: str,
        query: str,
        *,
        limit: int = 10,
        category: str | None = None,
        min_score: float = 0.0,
        half_life_days: float = 30.0,
    ) -> list[LongTermSearchResult]:
        tenant_id = validate_identifier(tenant_id, "tenant_id")
        user_id = validate_identifier(user_id, "user_id")
        if not isinstance(query, str) or not query.strip():
            raise ValueError("query cannot be empty")
        if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= 100:
            raise ValueError("limit must be between 1 and 100")
        if isinstance(min_score, bool) or not isinstance(min_score, (int, float)):
            raise ValueError("min_score must be numeric")
        if not math.isfinite(float(min_score)) or not 0.0 <= min_score <= 1.0:
            raise ValueError("min_score must be between 0 and 1")
        if (
            isinstance(half_life_days, bool)
            or not isinstance(half_life_days, (int, float))
            or not math.isfinite(float(half_life_days))
            or half_life_days <= 0
        ):
            raise ValueError("half_life_days must be positive and finite")

        query_tokens = _tokens(query)
        records = self.store.list_records(
            tenant_id, user_id, include_archived=False, category=category, limit=1000
        )
        now = datetime.now(timezone.utc)
        results: list[LongTermSearchResult] = []

        for record in records:
            content_tokens = _tokens(record.content)
            if query_tokens:
                overlap = len(query_tokens & content_tokens)
                relevance = overlap / len(query_tokens)
                if record.content.casefold() == query.casefold():
                    relevance = 1.0
            else:
                relevance = 0.0

            age_seconds = max(0.0, (now - record.updated_at).total_seconds())
            age_days = age_seconds / 86400.0
            recency = math.exp(-math.log(2.0) * age_days / float(half_life_days))

            # Transparent baseline score. Tune weights using offline evaluation.
            score = min(
                1.0,
                0.65 * relevance + 0.25 * record.importance + 0.10 * recency,
            )
            if score >= float(min_score):
                results.append(
                    LongTermSearchResult(
                        record=record,
                        score=score,
                        relevance=relevance,
                        importance=record.importance,
                        recency=recency,
                    )
                )

        results.sort(
            key=lambda item: (
                item.score,
                item.record.updated_at,
                item.record.memory_id,
            ),
            reverse=True,
        )
        return results[:limit]
