"""
Batch scheduling utilities.
"""

from __future__ import annotations

from dataclasses import dataclass
from threading import Event, Thread
from time import sleep
from typing import Callable

from .batcher import (
    Batch,
    EmbeddingBatcher,
)
from .queue import (
    BatchQueue,
    QueueItem,
)


@dataclass
class SchedulerConfig:
    """Batch scheduler configuration."""

    batch_size: int = 32

    interval_seconds: float = 0.05

    max_queue_size: int = 1000

    def __post_init__(self) -> None:

        if self.batch_size <= 0:
            raise ValueError(
                "batch_size must be positive."
            )

        if self.interval_seconds < 0:
            raise ValueError(
                "interval_seconds cannot be negative."
            )


class BatchScheduler:
    """
    Groups queued embedding requests into batches.

    The scheduler can run synchronously using `next_batch`
    or asynchronously using `start`.
    """

    def __init__(
        self,
        config: SchedulerConfig | None = None,
    ) -> None:

        self.config = (
            config
            or SchedulerConfig()
        )

        self.queue = BatchQueue(
            max_size=self.config.max_queue_size
        )

        self.batcher = EmbeddingBatcher()

        self._stop_event = Event()
        self._thread: Thread | None = None

    def submit(
        self,
        item: QueueItem,
    ) -> None:

        self.queue.put(item)

    def next_batch(
        self,
        timeout: float | None = None,
    ) -> Batch | None:

        items = self.queue.get_many(
            self.config.batch_size,
            timeout,
        )

        if not items:
            return None

        return Batch(
            texts=[
                item.text
                for item in items
            ],
            metadata=[
                item.metadata
                for item in items
            ],
        )

    def start(
        self,
        handler: Callable[
            [Batch],
            None,
        ],
    ) -> None:

        if self._thread is not None:
            return

        self._stop_event.clear()

        def worker() -> None:

            while not self._stop_event.is_set():

                batch = self.next_batch(
                    timeout=self.config.interval_seconds
                )

                if batch is None:
                    continue

                try:
                    handler(batch)
                finally:

                    for _ in batch.texts:
                        self.queue.task_done()

        self._thread = Thread(
            target=worker,
            daemon=True,
        )

        self._thread.start()

    def stop(
        self,
        timeout: float = 5.0,
    ) -> None:

        self._stop_event.set()

        if self._thread is not None:
            self._thread.join(
                timeout=timeout
            )

        self._thread = None

    @property
    def running(self) -> bool:
        return (
            self._thread is not None
            and self._thread.is_alive()
        )