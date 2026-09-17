"""
Human feedback analysis.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .collector import (
    FeedbackCollector,
)


@dataclass
class FeedbackAnalysis:
    """Aggregated feedback analysis."""

    total_feedback: int

    average_rating: float

    normalized_score: float

    positive_count: int

    neutral_count: int

    negative_count: int

    comments: list[str] = field(
        default_factory=list
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


class FeedbackAnalyzer:
    """
    Analyzes human ratings.

    Rating interpretation:

        4-5 = positive
        3   = neutral
        0-2 = negative
    """

    def analyze(
        self,
        collector: FeedbackCollector,
    ) -> FeedbackAnalysis:

        feedback = collector.all()

        if not feedback:

            return FeedbackAnalysis(
                total_feedback=0,
                average_rating=0.0,
                normalized_score=0.0,
                positive_count=0,
                neutral_count=0,
                negative_count=0,
            )

        ratings = [
            item.rating
            for item in feedback
        ]

        average_rating = sum(
            ratings
        ) / len(ratings)

        positive = sum(
            rating >= 4
            for rating in ratings
        )

        neutral = sum(
            rating == 3
            for rating in ratings
        )

        negative = sum(
            rating <= 2
            for rating in ratings
        )

        comments = [
            item.comment
            for item in feedback
            if item.comment.strip()
        ]

        return FeedbackAnalysis(
            total_feedback=len(feedback),
            average_rating=average_rating,
            normalized_score=(
                average_rating / 5.0
            ),
            positive_count=int(
                positive
            ),
            neutral_count=int(
                neutral
            ),
            negative_count=int(
                negative
            ),
            comments=comments,
        )

    def sentiment_ratio(
        self,
        collector: FeedbackCollector,
    ) -> dict[str, float]:

        analysis = self.analyze(
            collector
        )

        total = analysis.total_feedback

        if total == 0:

            return {
                "positive": 0.0,
                "neutral": 0.0,
                "negative": 0.0,
            }

        return {
            "positive":
                analysis.positive_count / total,
            "neutral":
                analysis.neutral_count / total,
            "negative":
                analysis.negative_count / total,
        }