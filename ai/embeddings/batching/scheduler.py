from dataclasses import dataclass
from time import monotonic

from ai.embeddings.exceptions import EmbeddingValidationError


@dataclass(frozen=True)
class BatchSchedule:
    batch_id: int
    item_count: int
    scheduled_at: float


class EmbeddingBatchScheduler:
    """Create lightweight batch schedules without running background threads."""

    def __init__(
        self,
        batch_size: int = 32,
        max_batch_size: int = 512,
    ) -> None:
        if isinstance(batch_size, bool) or not isinstance(batch_size, int):
            raise EmbeddingValidationError("batch_size must be an integer")
        if isinstance(max_batch_size, bool) or not isinstance(max_batch_size, int):
            raise EmbeddingValidationError("max_batch_size must be an integer")
        if batch_size < 1 or max_batch_size < batch_size:
            raise EmbeddingValidationError("Invalid batch-size limits")

        self.batch_size = batch_size
        self.max_batch_size = max_batch_size
        self._next_id = 1

    def schedule(self, item_count: int) -> list[BatchSchedule]:
        if isinstance(item_count, bool) or not isinstance(item_count, int):
            raise EmbeddingValidationError("item_count must be an integer")
        if item_count < 0:
            raise EmbeddingValidationError("item_count cannot be negative")

        schedules = []
        remaining = item_count

        while remaining:
            count = min(remaining, self.batch_size, self.max_batch_size)
            schedules.append(
                BatchSchedule(
                    batch_id=self._next_id,
                    item_count=count,
                    scheduled_at=monotonic(),
                )
            )
            self._next_id += 1
            remaining -= count

        return schedules
