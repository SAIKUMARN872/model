"""
Quality rating utilities.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Any


class RatingLevel(
    str,
    Enum,
):
    EXCELLENT = "excellent"
    GOOD = "good"
    AVERAGE = "average"
    POOR = "poor"
    VERY_POOR = "very_poor"


@dataclass
class Rating:
    """Quality rating."""

    score: float

    level: RatingLevel

    comment: str = ""

    def __post_init__(self) -> None:

        if not 0 <= self.score <= 1:

            raise ValueError(
                "score must be between 0 and 1."
            )

    @property
    def percentage(self) -> float:
        return self.score * 100

    def to_dict(
        self,
    ) -> dict[str, Any]:

        return {
            "score": self.score,
            "percentage":
                self.percentage,
            "level":
                self.level.value,
            "comment":
                self.comment,
        }


def create_rating(
    score: float,
    comment: str = "",
) -> Rating:

    score = float(score)

    if not 0 <= score <= 1:
        raise ValueError(
            "score must be between 0 and 1."
        )

    if score >= 0.90:

        level = RatingLevel.EXCELLENT

    elif score >= 0.75:

        level = RatingLevel.GOOD

    elif score >= 0.50:

        level = RatingLevel.AVERAGE

    elif score >= 0.25:

        level = RatingLevel.POOR

    else:

        level = RatingLevel.VERY_POOR

    return Rating(
        score=score,
        level=level,
        comment=comment,
    )