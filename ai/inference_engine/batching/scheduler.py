from __future__ import annotations

from ai.inference_engine.models import InferenceRequest

from .batcher import RequestBatcher
from .queue import InferenceQueue


class BatchScheduler:
    """Schedule queued requests into executable batches."""

    def __init__(
        self,
        batcher: RequestBatcher | None = None,
    ) -> None:
        self.batcher = (
            batcher
            or RequestBatcher()
        )

    def schedule(
        self,
        queue: InferenceQueue,
    ) -> list[InferenceRequest]:
        return self.batcher.create_batch(queue)

    def schedule_all(
        self,
        queue: InferenceQueue,
    ) -> list[list[InferenceRequest]]:
        batches: list[list[InferenceRequest]] = []

        while queue.size > 0:
            batches.append(
                self.schedule(queue)
            )

        return batches


__all__ = ["BatchScheduler"]
