from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum
from typing import Any, Mapping


class FeedbackType(str, Enum):
    """Types of feedback used by the adaptive learning system."""

    EXPLICIT = "explicit"
    IMPLICIT = "implicit"
    EVALUATION = "evaluation"
    OUTCOME = "outcome"


class FeedbackSignal(str, Enum):
    """Normalized learning signals."""

    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"


class LearningObjective(str, Enum):
    """Optimization objectives learned from historical outcomes."""

    COST = "cost"
    LATENCY = "latency"
    QUALITY = "quality"
    RELIABILITY = "reliability"
    BALANCED = "balanced"


@dataclass(frozen=True)
class FeedbackRecord:
    """A single feedback event produced by an execution."""

    feedback_id: str
    request_id: str
    feedback_type: FeedbackType
    signal: FeedbackSignal
    value: Decimal
    timestamp: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    model: str | None = None
    provider: str | None = None
    metadata: Mapping[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.feedback_id.strip():
            raise ValueError("feedback_id cannot be empty")

        if not self.request_id.strip():
            raise ValueError("request_id cannot be empty")

        value = Decimal(str(self.value))

        if value < Decimal("-1") or value > Decimal("1"):
            raise ValueError("feedback value must be between -1 and 1")

        object.__setattr__(self, "value", value)
        object.__setattr__(self, "metadata", dict(self.metadata))

        if self.timestamp.tzinfo is None:
            object.__setattr__(
                self,
                "timestamp",
                self.timestamp.replace(tzinfo=timezone.utc),
            )

    @property
    def is_positive(self) -> bool:
        return self.signal == FeedbackSignal.POSITIVE

    @property
    def is_negative(self) -> bool:
        return self.signal == FeedbackSignal.NEGATIVE

    @property
    def is_neutral(self) -> bool:
        return self.signal == FeedbackSignal.NEUTRAL

    def as_dict(self) -> dict[str, Any]:
        return {
            "feedback_id": self.feedback_id,
            "request_id": self.request_id,
            "feedback_type": self.feedback_type.value,
            "signal": self.signal.value,
            "value": str(self.value),
            "timestamp": self.timestamp.isoformat(),
            "model": self.model,
            "provider": self.provider,
            "metadata": dict(self.metadata),
        }


@dataclass(frozen=True)
class LearningObservation:
    """Normalized observation used by a learner."""

    observation_id: str
    request_id: str
    model: str
    provider: str
    objective: LearningObjective
    reward: Decimal
    cost: Decimal = Decimal("0")
    latency_ms: Decimal = Decimal("0")
    quality: Decimal = Decimal("0")
    success: bool = True
    timestamp: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    metadata: Mapping[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.observation_id.strip():
            raise ValueError("observation_id cannot be empty")

        if not self.request_id.strip():
            raise ValueError("request_id cannot be empty")

        if not self.model.strip():
            raise ValueError("model cannot be empty")

        if not self.provider.strip():
            raise ValueError("provider cannot be empty")

        reward = Decimal(str(self.reward))
        cost = Decimal(str(self.cost))
        latency = Decimal(str(self.latency_ms))
        quality = Decimal(str(self.quality))

        if cost < 0:
            raise ValueError("cost cannot be negative")

        if latency < 0:
            raise ValueError("latency_ms cannot be negative")

        if quality < 0 or quality > 1:
            raise ValueError("quality must be between 0 and 1")

        object.__setattr__(self, "reward", reward)
        object.__setattr__(self, "cost", cost)
        object.__setattr__(self, "latency_ms", latency)
        object.__setattr__(self, "quality", quality)
        object.__setattr__(self, "metadata", dict(self.metadata))

        if self.timestamp.tzinfo is None:
            object.__setattr__(
                self,
                "timestamp",
                self.timestamp.replace(tzinfo=timezone.utc),
            )

    def as_dict(self) -> dict[str, Any]:
        return {
            "observation_id": self.observation_id,
            "request_id": self.request_id,
            "model": self.model,
            "provider": self.provider,
            "objective": self.objective.value,
            "reward": str(self.reward),
            "cost": str(self.cost),
            "latency_ms": str(self.latency_ms),
            "quality": str(self.quality),
            "success": self.success,
            "timestamp": self.timestamp.isoformat(),
            "metadata": dict(self.metadata),
        }


@dataclass(frozen=True)
class LearningScore:
    """Learned score for a model/provider combination."""

    model: str
    provider: str
    objective: LearningObjective
    score: Decimal
    sample_count: int
    positive_count: int
    negative_count: int
    average_reward: Decimal
    confidence: Decimal

    def __post_init__(self) -> None:
        if not self.model.strip():
            raise ValueError("model cannot be empty")

        if not self.provider.strip():
            raise ValueError("provider cannot be empty")

        if self.sample_count < 0:
            raise ValueError("sample_count cannot be negative")

        if self.positive_count < 0:
            raise ValueError("positive_count cannot be negative")

        if self.negative_count < 0:
            raise ValueError("negative_count cannot be negative")

        score = Decimal(str(self.score))
        reward = Decimal(str(self.average_reward))
        confidence = Decimal(str(self.confidence))

        if confidence < 0 or confidence > 1:
            raise ValueError("confidence must be between 0 and 1")

        object.__setattr__(self, "score", score)
        object.__setattr__(self, "average_reward", reward)
        object.__setattr__(self, "confidence", confidence)

    def as_dict(self) -> dict[str, Any]:
        return {
            "model": self.model,
            "provider": self.provider,
            "objective": self.objective.value,
            "score": str(self.score),
            "sample_count": self.sample_count,
            "positive_count": self.positive_count,
            "negative_count": self.negative_count,
            "average_reward": str(self.average_reward),
            "confidence": str(self.confidence),
        }


@dataclass(frozen=True)
class LearningState:
    """Current adaptive-learning state."""

    objective: LearningObjective
    total_observations: int
    total_feedback: int
    model_scores: Mapping[str, LearningScore] = field(default_factory=dict)
    updated_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    metadata: Mapping[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if self.total_observations < 0:
            raise ValueError("total_observations cannot be negative")

        if self.total_feedback < 0:
            raise ValueError("total_feedback cannot be negative")

        object.__setattr__(self, "model_scores", dict(self.model_scores))
        object.__setattr__(self, "metadata", dict(self.metadata))

        if self.updated_at.tzinfo is None:
            object.__setattr__(
                self,
                "updated_at",
                self.updated_at.replace(tzinfo=timezone.utc),
            )

    def as_dict(self) -> dict[str, Any]:
        return {
            "objective": self.objective.value,
            "total_observations": self.total_observations,
            "total_feedback": self.total_feedback,
            "model_scores": {
                key: value.as_dict()
                for key, value in self.model_scores.items()
            },
            "updated_at": self.updated_at.isoformat(),
            "metadata": dict(self.metadata),
        }


__all__ = [
    "FeedbackType",
    "FeedbackSignal",
    "LearningObjective",
    "FeedbackRecord",
    "LearningObservation",
    "LearningScore",
    "LearningState",
]
