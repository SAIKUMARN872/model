from __future__ import annotations

from dataclasses import dataclass

from .memory import MemoryRecord, ModelMemory


@dataclass(frozen=True)
class ModelPerformance:
    model_id: str
    samples: int
    success_rate: float
    average_quality: float
    average_latency_ms: float
    average_cost: float


class MemoryHistory:
    """Query historical model performance from ModelMemory."""

    def __init__(self, memory: ModelMemory) -> None:
        if not isinstance(memory, ModelMemory):
            raise TypeError("memory must be a ModelMemory instance")

        self._memory = memory

    @property
    def memory(self) -> ModelMemory:
        return self._memory

    def all(self) -> list[MemoryRecord]:
        return self._memory.records()

    def recent(self, limit: int = 10) -> list[MemoryRecord]:
        return self._memory.recent(limit)

    def for_model(
        self,
        model_id: str,
        limit: int | None = None,
    ) -> list[MemoryRecord]:
        return self._memory.model_records(
            model_id=model_id,
            limit=limit,
        )

    def performance(
        self,
        model_id: str,
        limit: int | None = None,
    ) -> ModelPerformance:
        records = self.for_model(
            model_id=model_id,
            limit=limit,
        )

        if not records:
            return ModelPerformance(
                model_id=str(model_id).strip(),
                samples=0,
                success_rate=0.0,
                average_quality=0.0,
                average_latency_ms=0.0,
                average_cost=0.0,
            )

        samples = len(records)

        success_count = sum(
            1 for record in records if record.success
        )

        success_rate = success_count / samples

        average_quality = (
            sum(record.quality_score for record in records)
            / samples
        )

        average_latency_ms = (
            sum(record.latency_ms for record in records)
            / samples
        )

        average_cost = (
            sum(record.cost for record in records)
            / samples
        )

        return ModelPerformance(
            model_id=str(model_id).strip(),
            samples=samples,
            success_rate=success_rate,
            average_quality=average_quality,
            average_latency_ms=average_latency_ms,
            average_cost=average_cost,
        )

    def best_by_quality(
        self,
        model_ids: list[str],
        limit: int | None = None,
    ) -> str | None:
        candidates = []

        for model_id in model_ids:
            performance = self.performance(
                model_id=model_id,
                limit=limit,
            )

            if performance.samples > 0:
                candidates.append(performance)

        if not candidates:
            return None

        return max(
            candidates,
            key=lambda item: (
                item.average_quality,
                item.success_rate,
                -item.average_latency_ms,
            ),
        ).model_id

    def best_by_latency(
        self,
        model_ids: list[str],
        limit: int | None = None,
    ) -> str | None:
        candidates = []

        for model_id in model_ids:
            performance = self.performance(
                model_id=model_id,
                limit=limit,
            )

            if performance.samples > 0:
                candidates.append(performance)

        if not candidates:
            return None

        return min(
            candidates,
            key=lambda item: (
                item.average_latency_ms,
                -item.success_rate,
                -item.average_quality,
            ),
        ).model_id

    def best_by_cost(
        self,
        model_ids: list[str],
        limit: int | None = None,
    ) -> str | None:
        candidates = []

        for model_id in model_ids:
            performance = self.performance(
                model_id=model_id,
                limit=limit,
            )

            if performance.samples > 0:
                candidates.append(performance)

        if not candidates:
            return None

        return min(
            candidates,
            key=lambda item: (
                item.average_cost,
                -item.success_rate,
                -item.average_quality,
            ),
        ).model_id


__all__ = [
    "MemoryHistory",
    "ModelPerformance",
]
