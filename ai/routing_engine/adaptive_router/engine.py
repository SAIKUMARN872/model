from __future__ import annotations

from statistics import mean

from ai.routing_engine.learning_router.feedback import FeedbackStore
from ai.routing_engine.model_memory.memory import ModelMemory
from ai.routing_engine.models import ModelCandidate

from .models import AdaptiveModelSignal


class AdaptiveRoutingEngine:
    "Build historical routing signals from existing ModelNow intelligence."

    def __init__(
        self,
        model_memory: ModelMemory | None = None,
        feedback_store: FeedbackStore | None = None,
        min_samples: int = 1,
    ) -> None:
        if min_samples <= 0:
            raise ValueError("min_samples must be greater than zero")

        self.model_memory = model_memory or ModelMemory()
        self.feedback_store = feedback_store or FeedbackStore()
        self.min_samples = int(min_samples)

    def signal(
        self,
        candidate: ModelCandidate,
        task_type: str | None = None,
    ) -> AdaptiveModelSignal | None:
        records = self.model_memory.model_records(
            candidate.model_id
        )

        if task_type:
            task_type = task_type.strip().lower()
            records = [
                record
                for record in records
                if record.task_type is None
                or record.task_type.strip().lower() == task_type
            ]

        feedback = self.feedback_store.for_model(
            candidate.model_id
        )

        if task_type:
            feedback = [
                item
                for item in feedback
                if item.task_type.strip().lower() == task_type
            ]

        samples = len(records)

        if samples < self.min_samples:
            return None

        quality_values = [
            float(record.quality_score)
            for record in records
        ]

        latency_values = [
            float(record.latency_ms)
            for record in records
        ]

        cost_values = [
            float(record.cost)
            for record in records
        ]

        success_values = [
            1.0 if record.success else 0.0
            for record in records
        ]

        reward_values = [
            float(item.reward)
            for item in feedback
            if item.reward is not None
        ]

        confidence = min(1.0, samples / 10.0)

        return AdaptiveModelSignal(
            model_id=candidate.model_id,
            samples=samples,
            quality_score=mean(quality_values),
            latency_ms=mean(latency_values),
            cost=mean(cost_values),
            success_rate=mean(success_values),
            reward=mean(reward_values)
            if reward_values
            else None,
            confidence=confidence,
            metadata={
                "memory_samples": samples,
                "feedback_samples": len(feedback),
                "task_type": task_type,
            },
        )

    def signals(
        self,
        candidates: list[ModelCandidate],
        task_type: str | None = None,
    ) -> dict[str, AdaptiveModelSignal]:
        result: dict[str, AdaptiveModelSignal] = {}

        for candidate in candidates:
            signal = self.signal(candidate, task_type=task_type)

            if signal is not None:
                result[candidate.model_id] = signal

        return result


__all__ = [
    "AdaptiveRoutingEngine",
]
