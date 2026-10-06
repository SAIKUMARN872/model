"""Adaptive learning for model and provider selection."""

from __future__ import annotations

from collections import defaultdict
from decimal import Decimal
from threading import RLock
from typing import Iterable, Optional

from .feedback import FeedbackCollector
from .models import (
    FeedbackRecord,
    FeedbackSignal,
    FeedbackType,
    LearningObjective,
    LearningObservation,
    LearningScore,
    LearningState,
)

__all__ = ["AdaptiveLearner", "create_adaptive_learner"]


def _decimal(value: object, field: str) -> Decimal:
    try:
        result = Decimal(str(value))
    except Exception as exc:
        raise ValueError(f"{field} must be numeric") from exc
    if not result.is_finite():
        raise ValueError(f"{field} must be finite")
    return result


def _objective(value: LearningObjective | str) -> LearningObjective:
    if isinstance(value, LearningObjective):
        return value
    try:
        return LearningObjective(str(value).lower())
    except ValueError:
        try:
            return LearningObjective[str(value).upper()]
        except KeyError as exc:
            raise ValueError(f"Unsupported learning objective: {value}") from exc


class AdaptiveLearner:
    """Maintain deterministic, in-memory performance estimates.

    Observations supply measured outcomes. Feedback adjusts the reward estimate.
    Lower cost and latency are converted to relative scores when candidates are
    compared; quality and reliability favor higher values.
    """

    def __init__(
        self,
        feedback_collector: Optional[FeedbackCollector] = None,
        objective: LearningObjective | str = LearningObjective.BALANCED,
        learning_rate: float = 0.25,
        min_confidence_samples: int = 5,
    ) -> None:
        rate = _decimal(learning_rate, "learning_rate")
        if not Decimal("0") < rate <= Decimal("1"):
            raise ValueError("learning_rate must be in (0, 1]")
        if isinstance(min_confidence_samples, bool) or min_confidence_samples < 1:
            raise ValueError("min_confidence_samples must be at least 1")

        self.feedback_collector = feedback_collector or FeedbackCollector()
        self.objective = _objective(objective)
        self.learning_rate = rate
        self.min_confidence_samples = min_confidence_samples
        self._observations: list[LearningObservation] = []
        self._feedback: list[FeedbackRecord] = []
        self._lock = RLock()

    def observe(self, observation: LearningObservation) -> LearningObservation:
        """Store one measured model outcome."""
        if not isinstance(observation, LearningObservation):
            raise TypeError("observation must be a LearningObservation")
        with self._lock:
            self._observations.append(observation)
        return observation

    def observe_many(
        self, observations: Iterable[LearningObservation]
    ) -> int:
        """Store multiple observations and return the number added."""
        batch = list(observations)
        if any(not isinstance(item, LearningObservation) for item in batch):
            raise TypeError("all items must be LearningObservation instances")
        with self._lock:
            self._observations.extend(batch)
        return len(batch)

    def record_feedback(self, feedback: FeedbackRecord) -> FeedbackRecord:
        """Add an existing feedback record to this learner."""
        if not isinstance(feedback, FeedbackRecord):
            raise TypeError("feedback must be a FeedbackRecord")
        with self._lock:
            self._feedback.append(feedback)
        return feedback

    def collect_feedback(self, **kwargs: object) -> FeedbackRecord:
        """Collect feedback through the configured FeedbackCollector."""
        feedback = self.feedback_collector.record(**kwargs)
        self.record_feedback(feedback)
        return feedback

    def _snapshot(
        self,
    ) -> tuple[list[LearningObservation], list[FeedbackRecord]]:
        with self._lock:
            observations = list(self._observations)
            feedback = list(self._feedback)
        known_ids = {item.feedback_id for item in feedback}
        for item in self.feedback_collector.records():
            if item.feedback_id not in known_ids:
                feedback.append(item)
                known_ids.add(item.feedback_id)
        return observations, feedback

    @staticmethod
    def _feedback_reward(item: FeedbackRecord) -> Decimal:
        value = item.value
        if item.feedback_type == FeedbackType.EVALUATION:
            # Evaluation values are raw scores in [0, 1].
            return (value * Decimal("2")) - Decimal("1")
        if item.signal == FeedbackSignal.POSITIVE:
            return abs(value)
        if item.signal == FeedbackSignal.NEGATIVE:
            return -abs(value)
        return Decimal("0")

    def _observation_reward(
        self, item: LearningObservation, objective: LearningObjective
    ) -> Decimal:
        reward = item.reward
        if objective == LearningObjective.COST:
            # A lower-cost successful outcome is preferred. Cost is normalized
            # relative to other observations in score_candidates().
            return reward
        if objective == LearningObjective.LATENCY:
            return reward
        if objective == LearningObjective.QUALITY:
            return (item.quality * Decimal("2")) - Decimal("1")
        if objective == LearningObjective.RELIABILITY:
            return Decimal("1") if item.success else Decimal("-1")

        # Balanced objective blends explicit reward, quality, and reliability.
        success_reward = Decimal("1") if item.success else Decimal("-1")
        return (
            reward * Decimal("0.5")
            + item.quality * Decimal("0.3")
            + success_reward * Decimal("0.2")
        )

    @staticmethod
    def _relative_lower_is_better(
        values: list[Decimal], value: Decimal
    ) -> Decimal:
        """Map lower-is-better measurements to a stable [0, 1] score."""
        if not values:
            return Decimal("0.5")
        low, high = min(values), max(values)
        if high == low:
            return Decimal("1")
        return Decimal("1") - ((value - low) / (high - low))

    def score_candidates(
        self,
        objective: LearningObjective | str | None = None,
    ) -> list[LearningScore]:
        """Compute scores for all observed or feedback-associated candidates."""
        target = _objective(objective) if objective is not None else self.objective
        observations, feedback = self._snapshot()

        groups: dict[tuple[str, str], list[LearningObservation]] = defaultdict(list)
        for item in observations:
            groups[(item.model, item.provider)].append(item)

        feedback_groups: dict[tuple[str, str], list[FeedbackRecord]] = defaultdict(list)
        for item in feedback:
            if item.model and item.provider:
                feedback_groups[(item.model, item.provider)].append(item)

        keys = set(groups) | set(feedback_groups)
        if not keys:
            return []

        costs = [item.cost for item in observations]
        latencies = [Decimal(str(item.latency_ms)) for item in observations]
        scores: list[LearningScore] = []

        for model, provider in sorted(keys):
            items = groups.get((model, provider), [])
            feedback_items = feedback_groups.get((model, provider), [])
            rewards: list[Decimal] = []

            for item in items:
                reward = self._observation_reward(item, target)
                if target == LearningObjective.COST:
                    reward = (
                        self._relative_lower_is_better(costs, item.cost) * 2
                    ) - 1
                    if not item.success:
                        reward = min(reward, Decimal("-0.5"))
                elif target == LearningObjective.LATENCY:
                    latency = Decimal(str(item.latency_ms))
                    reward = (
                        self._relative_lower_is_better(latencies, latency) * 2
                    ) - 1
                    if not item.success:
                        reward = min(reward, Decimal("-0.5"))
                rewards.append(reward)

            rewards.extend(self._feedback_reward(item) for item in feedback_items)
            if not rewards:
                continue

            positive_count = sum(value > 0 for value in rewards)
            negative_count = sum(value < 0 for value in rewards)
            average = sum(rewards, Decimal("0")) / Decimal(len(rewards))

            # Exponential update rewards recent outcomes without discarding history.
            learned = rewards[0]
            for reward in rewards[1:]:
                learned = (
                    self.learning_rate * reward
                    + (Decimal("1") - self.learning_rate) * learned
                )

            confidence = min(
                Decimal("1"),
                Decimal(len(rewards)) / Decimal(self.min_confidence_samples),
            )

            scores.append(
                LearningScore(
                    model=model,
                    provider=provider,
                    objective=target,
                    score=learned,
                    sample_count=len(rewards),
                    positive_count=positive_count,
                    negative_count=negative_count,
                    average_reward=average,
                    confidence=confidence,
                )
            )

        return sorted(scores, key=lambda item: (-item.score, -item.confidence, item.model))

    def score(
        self,
        model: str,
        provider: str,
        objective: LearningObjective | str | None = None,
    ) -> Optional[LearningScore]:
        """Return a candidate's score, or None if no evidence exists."""
        for item in self.score_candidates(objective):
            if item.model == model and item.provider == provider:
                return item
        return None

    def rank(
        self,
        objective: LearningObjective | str | None = None,
    ) -> list[LearningScore]:
        """Rank candidates from strongest to weakest estimated performance."""
        return self.score_candidates(objective)

    def best_candidate(
        self,
        objective: LearningObjective | str | None = None,
    ) -> Optional[LearningScore]:
        """Return the top-ranked candidate, or None when no data exists."""
        ranked = self.rank(objective)
        return ranked[0] if ranked else None

    def state(
        self,
        objective: LearningObjective | str | None = None,
    ) -> LearningState:
        """Return a snapshot of learning state."""
        target = _objective(objective) if objective is not None else self.objective
        observations, feedback = self._snapshot()
        scores = self.score_candidates(target)
        from datetime import datetime, timezone

        return LearningState(
            objective=target,
            total_observations=len(observations),
            total_feedback=len(feedback),
            model_scores={
                f"{item.provider}:{item.model}": item.as_dict()
                for item in scores
            },
            updated_at=datetime.now(timezone.utc),
            metadata={
                "learning_rate": str(self.learning_rate),
                "min_confidence_samples": self.min_confidence_samples,
            },
        )

    def reset(self, clear_feedback_collector: bool = False) -> None:
        """Clear this learner's history, optionally clearing its collector too."""
        with self._lock:
            self._observations.clear()
            self._feedback.clear()
        if clear_feedback_collector:
            self.feedback_collector.clear()

    def __len__(self) -> int:
        observations, feedback = self._snapshot()
        return len(observations) + len(feedback)


def create_adaptive_learner(
    feedback_collector: Optional[FeedbackCollector] = None,
    objective: LearningObjective | str = LearningObjective.BALANCED,
    learning_rate: float = 0.25,
    min_confidence_samples: int = 5,
) -> AdaptiveLearner:
    """Construct an AdaptiveLearner with validated configuration."""
    return AdaptiveLearner(
        feedback_collector=feedback_collector,
        objective=objective,
        learning_rate=learning_rate,
        min_confidence_samples=min_confidence_samples,
    )
