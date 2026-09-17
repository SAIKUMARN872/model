"""
Human feedback collection.
"""

from __future__ import annotations

from threading import RLock
from typing import Any

from .human_feedback import (
    HumanFeedback,
)


class FeedbackCollector:
    """Thread-safe feedback store."""

    def __init__(self) -> None:

        self._feedback: dict[
            str,
            HumanFeedback,
        ] = {}

        self._lock = RLock()

    def add(
        self,
        feedback: HumanFeedback,
    ) -> HumanFeedback:

        with self._lock:

            self._feedback[
                feedback.feedback_id
            ] = feedback

        return feedback

    def collect(
        self,
        rating: float,
        comment: str = "",
        **kwargs: Any,
    ) -> HumanFeedback:

        feedback = HumanFeedback(
            rating=rating,
            comment=comment,
            **kwargs,
        )

        return self.add(
            feedback
        )

    def get(
        self,
        feedback_id: str,
    ) -> HumanFeedback | None:

        with self._lock:

            return self._feedback.get(
                feedback_id
            )

    def all(
        self,
    ) -> list[HumanFeedback]:

        with self._lock:

            return list(
                self._feedback.values()
            )

    def for_item(
        self,
        item_id: str,
    ) -> list[HumanFeedback]:

        return [
            feedback
            for feedback in self.all()
            if feedback.item_id == item_id
        ]

    def for_user(
        self,
        user_id: str,
    ) -> list[HumanFeedback]:

        return [
            feedback
            for feedback in self.all()
            if feedback.user_id == user_id
        ]

    def remove(
        self,
        feedback_id: str,
    ) -> HumanFeedback | None:

        with self._lock:

            return self._feedback.pop(
                feedback_id,
                None,
            )

    def clear(self) -> None:

        with self._lock:

            self._feedback.clear()

    def count(self) -> int:

        with self._lock:

            return len(
                self._feedback
            )