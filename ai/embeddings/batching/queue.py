"""
Thread-safe queue for embedding requests.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from queue import Empty, Queue
from time import time
from typing import Any


@dataclass
class QueueItem:
    """One embedding request in the queue."""

    request_id: str
    text: str
    metadata: dict[str, Any] = field(
        default_factory=dict
    )
    created_at: float = field(
        default_factory=time
    )


class BatchQueue:
    """
    Thread-safe embedding request queue.
    """

    def __init__(
        self,
        max_size: int = 0,
    ) -> None:

        self._queue: Queue[QueueItem] = Queue(
            maxsize=max_size
        )

    def put(
        self,
        item: QueueItem,
        timeout: float | None = None,
    ) -> None:

        self._queue.put(
            item,
            timeout=timeout
        )

    def get(
        self,
        timeout: float | None = None,
    ) -> QueueItem:

        try:
            return self._queue.get(
                timeout=timeout
            )
        except Empty as exc:
            raise TimeoutError(
                "No embedding request available."
            ) from exc

    def task_done(self) -> None:
        self._queue.task_done()

    def qsize(self) -> int:
        return self._queue.qsize()

    def empty(self) -> bool:
        return self._queue.empty()

    def full(self) -> bool:
        return self._queue.full()

    def join(self) -> None:
        self._queue.join()

    def get_many(
        self,
        max_items: int,
        timeout: float | None = None,
    ) -> list[QueueItem]:

        if max_items <= 0:
            raise ValueError(
                "max_items must be greater than zero."
            )

        items: list[QueueItem] = []

        try:
            first = self.get(timeout)
            items.append(first)
        except TimeoutError:
            return items

        while len(items) < max_items:

            try:
                items.append(
                    self.get(
                        timeout=0
                    )
                )
            except TimeoutError:
                break

        return items