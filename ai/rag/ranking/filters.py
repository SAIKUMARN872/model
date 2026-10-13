from __future__ import annotations

from collections.abc import Sequence

from .reranker import RankingResult


def filter_by_min_score(
    results: Sequence[RankingResult],
    minimum_score: float,
) -> list[RankingResult]:
    """Keep results whose relevance score meets the threshold."""
    return [
        result
        for result in results
        if result.score >= minimum_score
    ]


def filter_by_document_ids(
    results: Sequence[RankingResult],
    allowed_ids: set[str],
) -> list[RankingResult]:
    """Keep results whose document ID is in the allowed set."""
    return [
        result
        for result in results
        if result.document.document_id in allowed_ids
    ]


__all__ = [
    "filter_by_min_score",
    "filter_by_document_ids",
]
