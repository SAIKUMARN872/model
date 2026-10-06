from __future__ import annotations

from ai.inference_engine.models import InferenceRequest

from .queue import InferenceQueue


class RequestBatcher:
    """Group queued inference requests into bounded batches."""

    def __init__(
        self,
        max_batch_size: int = 8,
    ) -> None:
        if max_batch_size < 1:
            raise ValueError(
                "max_batch_size must be at least 1."
            )

        self.max_batch_size = max_batch_size

    def create_batch(
        self,
        queue: InferenceQueue,
    ) -> list[InferenceRequest]:
        batch: list[InferenceRequest] = []

        while (
            queue.size > 0
            and len(batch) < self.max_batch_size
        ):
            batch.append(queue.get())

        return batch

    def batch(
        self,
        requests: list[InferenceRequest],
    ) -> list[list[InferenceRequest]]:
        if not requests:
            return []

        batches: list[list[InferenceRequest]] = []

        for index in range(
            0,
            len(requests),
            self.max_batch_size,
        ):
            batches.append(
                requests[
                    index:index + self.max_batch_size
                ]
            )

        return batches


__all__ = ["RequestBatcher"]
