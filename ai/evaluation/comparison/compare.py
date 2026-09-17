"""
Generic metric comparison.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class ComparisonResult:
    """Comparison between two values."""

    left_name: str

    right_name: str

    left_score: float

    right_score: float

    winner: str | None

    difference: float

    details: dict[str, Any] = field(
        default_factory=dict
    )


class Comparator:
    """Compares evaluation metrics."""

    def compare(
        self,
        left_name: str,
        left_score: float,
        right_name: str,
        right_score: float,
        higher_is_better: bool = True,
    ) -> ComparisonResult:

        left_score = float(
            left_score
        )

        right_score = float(
            right_score
        )

        difference = (
            left_score
            - right_score
        )

        if difference == 0:

            winner = None

        elif higher_is_better:

            winner = (
                left_name
                if difference > 0
                else right_name
            )

        else:

            winner = (
                left_name
                if difference < 0
                else right_name
            )

        return ComparisonResult(
            left_name=left_name,
            right_name=right_name,
            left_score=left_score,
            right_score=right_score,
            winner=winner,
            difference=abs(
                difference
            ),
            details={
                "higher_is_better":
                    higher_is_better,
            },
        )

    def compare_metrics(
        self,
        left_name: str,
        left_metrics: dict[str, float],
        right_name: str,
        right_metrics: dict[str, float],
        metric_directions: dict[
            str,
            bool,
        ] | None = None,
    ) -> dict[str, ComparisonResult]:

        metric_directions = (
            metric_directions or {}
        )

        results = {}

        common_metrics = (
            set(left_metrics)
            & set(right_metrics)
        )

        for metric in common_metrics:

            results[metric] = self.compare(
                left_name,
                left_metrics[metric],
                right_name,
                right_metrics[metric],
                metric_directions.get(
                    metric,
                    True,
                ),
            )

        return results