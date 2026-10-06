from __future__ import annotations

from dataclasses import dataclass, field
from heapq import heappop, heappush
from itertools import count
from threading import RLock
from typing import Generic, TypeVar


T = TypeVar("T")


@dataclass(frozen=True)
class QueueItem(Generic[T]):
    priority: int
    value: T
    sequence: int = field(compare=False)


class PriorityQueue(Generic[T]):
    def __init__(self) -> None:
        self._heap: list[
            tuple[int, int, T]
        ] = []
        self._sequence = count()
        self._lock = RLock()

    def put(
        self,
        value: T,
        *,
        priority: int = 0,
    ) -> QueueItem[T]:
        if not isinstance(priority, int):
            raise TypeError(
                "priority must be an integer"
            )

        sequence = next(self._sequence)

        with self._lock:
            heappush(
                self._heap,
                (
                    priority,
                    sequence,
                    value,
                ),
            )

        return QueueItem(
            priority=priority,
            value=value,
            sequence=sequence,
        )

    def get(self) -> T:
        with self._lock:
            if not self._heap:
                raise IndexError(
                    "priority queue is empty"
                )

            _, _, value = heappop(
                self._heap
            )

            return value

    def get_item(self) -> QueueItem[T]:
        with self._lock:
            if not self._heap:
                raise IndexError(
                    "priority queue is empty"
                )

            priority, sequence, value = heappop(
                self._heap
            )

            return QueueItem(
                priority=priority,
                value=value,
                sequence=sequence,
            )

    def peek(self) -> T:
        with self._lock:
            if not self._heap:
                raise IndexError(
                    "priority queue is empty"
                )

            return self._heap[0][2]

    def peek_item(self) -> QueueItem[T]:
        with self._lock:
            if not self._heap:
                raise IndexError(
                    "priority queue is empty"
                )

            priority, sequence, value = (
                self._heap[0]
            )

            return QueueItem(
                priority=priority,
                value=value,
                sequence=sequence,
            )

    def clear(self) -> None:
        with self._lock:
            self._heap.clear()

    def __len__(self) -> int:
        with self._lock:
            return len(self._heap)

    @property
    def empty(self) -> bool:
        with self._lock:
            return not self._heap

    @property
    def size(self) -> int:
        with self._lock:
            return len(self._heap)
