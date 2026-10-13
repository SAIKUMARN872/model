"""Aggregate and analyze human feedback."""
from __future__ import annotations

from collections import defaultdict
from collections.abc import Iterable
from statistics import mean
from typing import Any

from ai.evaluation.feedback.collector import FeedbackRecord


def analyze_feedback(records: Iterable[FeedbackRecord]) -> dict[str, Any]:
    """Summarize ratings globally and by model.

    Ratings 4–5 are positive, 1–2 negative, and 3 neutral.
    """
    if isinstance(records, (str, bytes, dict)):
        raise ValueError("records must be an iterable of FeedbackRecord objects")

    items = list(records)
    for item in items:
        if not isinstance(item, FeedbackRecord):
            raise ValueError("all records must be FeedbackRecord objects")

    by_model: dict[str, list[int]] = defaultdict(list)
    for item in items:
        by_model[item.model_name].append(item.rating)

    ratings = [item.rating for item in items]
    count = len(ratings)

    return {
        "feedback_count": count,
        "mean_rating": round(mean(ratings), 4) if ratings else None,
        "positive_count": sum(value >= 4 for value in ratings),
        "neutral_count": sum(value == 3 for value in ratings),
        "negative_count": sum(value <= 2 for value in ratings),
        "positive_rate": round(sum(value >= 4 for value in ratings) / count, 4)
        if count else None,
        "by_model": {
            name: {
                "feedback_count": len(values),
                "mean_rating": round(mean(values), 4),
                "positive_count": sum(value >= 4 for value in values),
                "negative_count": sum(value <= 2 for value in values),
            }
            for name, values in sorted(by_model.items())
        },
        "limitations": [
            "Feedback reflects submitted ratings and may be subject to selection bias.",
            "Aggregated ratings do not establish factual correctness.",
            "No persistence, identity verification, or duplicate-submission detection is provided.",
        ],
    }
