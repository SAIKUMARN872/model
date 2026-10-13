from __future__ import annotations

from collections.abc import Sequence

from .reranker import RankingResult


def sort_by_score(
    results: Sequence[RankingResult],
    *,
    descending: bool = True,
) -> list[RankingResult]:
    """Return ranking results ordered by relevance score."""
    return sorted(
        results,
        key=lambda result: result.score,
        reverse=descending,
    )


def top_results(
    results: Sequence[RankingResult],
    top_n: int,
) -> list[RankingResult]:
    """Return the highest-ranked results."""
    if top_n < 0:
        raise ValueError("top_n cannot be negative.")

    return sort_by_score(results)[:top_n]


__all__ = ["sort_by_score", "top_results"]
