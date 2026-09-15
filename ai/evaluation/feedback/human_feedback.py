"""
Human feedback models.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


@dataclass
class HumanFeedback:
    """Feedback submitted by a human evaluator."""

    rating: float

    comment: str = ""

    feedback_id: str = field(
        default_factory=lambda:
        f"feedback_{uuid4().hex}"
    )

    user_id: str | None = None

    item_id: str | None = None

    session_id: str | None = None

    created_at: datetime = field(
        default_factory=utc_now
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        self.rating = float(
            self.rating
        )

        if not 0 <= self.rating <= 5:

            raise ValueError(
                "rating must be between 0 and 5."
            )

    @property
    def normalized_rating(
        self,
    ) -> float:

        return self.rating / 5.0

    def to_dict(
        self,
    ) -> dict[str, Any]:

        return {
            "feedback_id":
                self.feedback_id,
            "rating":
                self.rating,
            "normalized_rating":
                self.normalized_rating,
            "comment":
                self.comment,
            "user_id":
                self.user_id,
            "item_id":
                self.item_id,
            "session_id":
                self.session_id,
            "created_at":
                self.created_at.isoformat(),
            "metadata":
                self.metadata,
        }