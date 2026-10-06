from __future__ import annotations

from dataclasses import dataclass, field
from time import time
from typing import Any


@dataclass(frozen=True)
class RoutingFeedback:
    request_id: str
    model_id: str
    provider: str
    tier: str
    task_type: str
    quality_score: float
    latency_ms: float
    cost: float
    success: bool = True
    reward: float | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    created_at: float = field(default_factory=time)

    def __post_init__(self) -> None:
        if not self.request_id.strip():
            raise ValueError("request_id cannot be empty")

        if not self.model_id.strip():
            raise ValueError("model_id cannot be empty")

        if not self.provider.strip():
            raise ValueError("provider cannot be empty")

        if not self.tier.strip():
            raise ValueError("tier cannot be empty")

        if not self.task_type.strip():
            raise ValueError("task_type cannot be empty")

        if not 0.0 <= float(self.quality_score) <= 1.0:
            raise ValueError(
                "quality_score must be between 0.0 and 1.0"
            )

        if float(self.latency_ms) < 0.0:
            raise ValueError(
                "latency_ms cannot be negative"
            )

        if float(self.cost) < 0.0:
            raise ValueError(
                "cost cannot be negative"
            )

        if self.reward is not None:
            if not -1.0 <= float(self.reward) <= 1.0:
                raise ValueError(
                    "reward must be between -1.0 and 1.0"
                )


class FeedbackStore:
    def __init__(self, max_records: int = 10_000) -> None:
        if max_records <= 0:
            raise ValueError(
                "max_records must be greater than zero"
            )

        self._max_records = int(max_records)
        self._records: list[RoutingFeedback] = []

    @property
    def max_records(self) -> int:
        return self._max_records

    def add(self, feedback: RoutingFeedback) -> RoutingFeedback:
        if not isinstance(feedback, RoutingFeedback):
            raise TypeError(
                "feedback must be a RoutingFeedback instance"
            )

        self._records.append(feedback)

        if len(self._records) > self._max_records:
            overflow = len(self._records) - self._max_records
            del self._records[:overflow]

        return feedback

    def add_many(
        self,
        feedback_items: list[RoutingFeedback],
    ) -> int:
        if not isinstance(feedback_items, list):
            raise TypeError(
                "feedback_items must be a list"
            )

        for feedback in feedback_items:
            if not isinstance(feedback, RoutingFeedback):
                raise TypeError(
                    "all items must be RoutingFeedback instances"
                )

        self._records.extend(feedback_items)

        if len(self._records) > self._max_records:
            overflow = len(self._records) - self._max_records
            del self._records[:overflow]

        return len(feedback_items)

    def records(self) -> list[RoutingFeedback]:
        return list(self._records)

    def recent(self, limit: int = 10) -> list[RoutingFeedback]:
        if limit <= 0:
            return []

        return list(reversed(self._records[-limit:]))

    def get(self, request_id: str) -> RoutingFeedback | None:
        request_id = str(request_id).strip()

        for feedback in reversed(self._records):
            if feedback.request_id == request_id:
                return feedback

        return None

    def count(self) -> int:
        return len(self._records)

    def clear(self) -> int:
        count = len(self._records)
        self._records.clear()
        return count

    def for_model(
        self,
        model_id: str,
    ) -> list[RoutingFeedback]:
        model_id = str(model_id).strip()

        return [
            feedback
            for feedback in reversed(self._records)
            if feedback.model_id == model_id
        ]

    def for_task(
        self,
        task_type: str,
    ) -> list[RoutingFeedback]:
        task_type = str(task_type).strip().lower()

        return [
            feedback
            for feedback in reversed(self._records)
            if feedback.task_type.lower() == task_type
        ]


__all__ = [
    "FeedbackStore",
    "RoutingFeedback",
]
