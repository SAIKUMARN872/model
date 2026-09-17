"""
Ranking engine for AI models and evaluation candidates.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .scorer import (
    ScoreResult,
    Scorer,
)


@dataclass
class RankedItem:
    """One ranked candidate."""

    rank: int
    name: str
    score: float
    percentage: float
    passed: bool
    metrics: dict[str, float] = field(
        default_factory=dict
    )
    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:
        return {
            "rank": self.rank,
            "name": self.name,
            "score": self.score,
            "percentage":
                self.percentage,
            "passed":
                self.passed,
            "metrics":
                dict(self.metrics),
            "metadata":
                dict(self.metadata),
        }


@dataclass
class RankingResult:
    """Complete ranking result."""

    items: list[RankedItem]

    winner: RankedItem | None

    total_items: int

    def to_dict(self) -> dict[str, Any]:
        return {
            "total_items":
                self.total_items,
            "winner":
                (
                    self.winner.to_dict()
                    if self.winner
                    else None
                ),
            "items": [
                item.to_dict()
                for item in self.items
            ],
        }


class RankingEngine:
    """Ranks candidates using the scoring engine."""

    def __init__(
        self,
        scorer: Scorer | None = None,
    ) -> None:

        self.scorer = (
            scorer
            or Scorer()
        )

    def rank(
        self,
        candidates: dict[
            str,
            dict[str, float],
        ],
    ) -> RankingResult:

        items: list[RankedItem] = []

        for name, metrics in (
            candidates.items()
        ):

            result = self.scorer.score(
                metrics
            )

            items.append(
                RankedItem(
                    rank=0,
                    name=name,
                    score=result.score,
                    percentage=
                        result.percentage,
                    passed=result.passed,
                    metrics=dict(metrics),
                )
            )

        items.sort(
            key=lambda item: item.score,
            reverse=True,
        )

        for index, item in enumerate(
            items,
            start=1,
        ):
            item.rank = index

        return RankingResult(
            items=items,
            winner=(
                items[0]
                if items
                else None
            ),
            total_items=len(items),
        )

    def rank_results(
        self,
        results: dict[
            str,
            ScoreResult,
        ],
    ) -> RankingResult:

        items: list[
            RankedItem
        ] = []

        for name, result in (
            results.items()
        ):

            metrics = {
                metric.name:
                    metric.raw_value
                for metric
                in result.metrics
            }

            items.append(
                RankedItem(
                    rank=0,
                    name=name,
                    score=result.score,
                    percentage=
                        result.percentage,
                    passed=result.passed,
                    metrics=metrics,
                    metadata=dict(
                        result.metadata
                    ),
                )
            )

        items.sort(
            key=lambda item: item.score,
            reverse=True,
        )

        for index, item in enumerate(
            items,
            start=1,
        ):
            item.rank = index

        return RankingResult(
            items=items,
            winner=(
                items[0]
                if items
                else None
            ),
            total_items=len(items),
        )

    def best(
        self,
        candidates: dict[
            str,
            dict[str, float],
        ],
    ) -> RankedItem | None:

        return self.rank(
            candidates
        ).winner

    def top(
        self,
        candidates: dict[
            str,
            dict[str, float],
        ],
        count: int = 3,
    ) -> list[RankedItem]:

        if count <= 0:
            raise ValueError(
                "count must be greater than zero."
            )

        return self.rank(
            candidates
        ).items[:count]