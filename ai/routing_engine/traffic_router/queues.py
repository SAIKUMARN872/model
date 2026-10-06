from __future__ import annotations

from dataclasses import dataclass, field
from enum import IntEnum
from heapq import heappop, heappush
from threading import Lock
from time import monotonic
from typing import Generic, TypeVar


T = TypeVar("T")


class QueuePriority(IntEnum):
    """Traffic priority levels for ModelNow requests."""

    LOW = 1
    NORMAL = 2
    HIGH = 3
    CRITICAL = 4


@dataclass(order=True)
class QueueItem(Generic[T]):
    """An item stored in the traffic queue."""

    sort_key: tuple[int, float, int] = field(
        init=False,
        repr=False,
    )
    priority: QueuePriority
    sequence: int
    payload: T = field(compare=False)
    enqueued_at: float = field(
        default_factory=monotonic,
        compare=False,
    )

    def __post_init__(self) -> None:
        self.sort_key = (
            -int(self.priority),
            self.enqueued_at,
            self.sequence,
        )


class PriorityQueue(Generic[T]):
    """Thread-safe priority queue for traffic requests."""

    def __init__(self) -> None:
        self._items: list[QueueItem[T]] = []
        self._sequence = 0
        self._lock = Lock()

    def put(
        self,
        payload: T,
        priority: QueuePriority = QueuePriority.NORMAL,
    ) -> QueueItem[T]:
        if not isinstance(priority, QueuePriority):
            priority = QueuePriority(priority)

        with self._lock:
            item = QueueItem(
                priority=priority,
                sequence=self._sequence,
                payload=payload,
            )
            self._sequence += 1
            heappush(
                self._items,
                item,
            )
            return item

    def get(self) -> QueueItem[T] | None:
        with self._lock:
            if not self._items:
                return None

            return heappop(self._items)

    def peek(self) -> QueueItem[T] | None:
        with self._lock:
            if not self._items:
                return None

            return min(
                self._items,
                key=lambda item: item.sort_key,
            )

    def clear(self) -> int:
        with self._lock:
            count = len(self._items)
            self._items.clear()
            return count

    def qsize(self) -> int:
        with self._lock:
            return len(self._items)

    def empty(self) -> bool:
        return self.qsize() == 0


__all__ = [
    "PriorityQueue",
    "QueueItem",
    "QueuePriority",
]
