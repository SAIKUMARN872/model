from __future__ import annotations

from dataclasses import dataclass
from threading import RLock
from typing import Any

from .priority_queue import PriorityQueue
from .scheduler import QueueScheduler, ScheduledItem
from .utils import normalize_priority


@dataclass(frozen=True)
class QueueMetrics:
    name: str
    size: int
    enqueued: int
    dequeued: int


@dataclass
class _QueueState:
    queue: PriorityQueue[Any]
    enqueued: int = 0
    dequeued: int = 0


class QueueManager:
    def __init__(self) -> None:
        self._queues: dict[str, _QueueState] = {}
        self._schedulers: dict[
            str,
            QueueScheduler[Any],
        ] = {}
        self._lock = RLock()

    @staticmethod
    def _validate_name(name: str) -> str:
        if not isinstance(name, str):
            raise TypeError(
                "queue name must be a string"
            )

        normalized = name.strip()

        if not normalized:
            raise ValueError(
                "queue name must not be empty"
            )

        return normalized

    def create(
        self,
        name: str,
        *,
        aging_enabled: bool = True,
        aging_interval_ms: float = 1000.0,
    ) -> None:
        name = self._validate_name(name)

        with self._lock:
            if name in self._queues:
                raise ValueError(
                    f"queue already exists: {name}"
                )

            self._queues[name] = _QueueState(
                queue=PriorityQueue()
            )

            self._schedulers[name] = (
                QueueScheduler(
                    aging_enabled=aging_enabled,
                    aging_interval_ms=(
                        aging_interval_ms
                    ),
                )
            )

    def ensure(
        self,
        name: str,
    ) -> None:
        name = self._validate_name(name)

        with self._lock:
            if name in self._queues:
                return

        self.create(name)

    def remove(
        self,
        name: str,
    ) -> None:
        name = self._validate_name(name)

        with self._lock:
            if name not in self._queues:
                raise KeyError(
                    f"queue not found: {name}"
                )

            del self._queues[name]
            del self._schedulers[name]

    def enqueue(
        self,
        name: str,
        value: Any,
        *,
        priority: int | str = 50,
        queued_at: float | None = None,
    ) -> ScheduledItem[Any]:
        name = self._validate_name(name)
        normalized_priority = normalize_priority(
            priority
        )

        self.ensure(name)

        with self._lock:
            state = self._queues[name]
            scheduler = self._schedulers[name]

            item = scheduler.schedule(
                value,
                priority=normalized_priority,
                queued_at=queued_at,
            )

            state.enqueued += 1

            return item

    def dequeue(
        self,
        name: str,
        *,
        current_time: float | None = None,
    ) -> ScheduledItem[Any]:
        name = self._validate_name(name)

        with self._lock:
            if name not in self._queues:
                raise KeyError(
                    f"queue not found: {name}"
                )

            scheduler = self._schedulers[name]

            if scheduler.empty:
                raise IndexError(
                    f"queue is empty: {name}"
                )

            item = scheduler.next(
                current_time=current_time
            )

            self._queues[name].dequeued += 1

            return item

    def peek(
        self,
        name: str,
    ) -> ScheduledItem[Any]:
        name = self._validate_name(name)

        with self._lock:
            if name not in self._queues:
                raise KeyError(
                    f"queue not found: {name}"
                )

            scheduler = self._schedulers[name]

            return scheduler.peek()

    def clear(
        self,
        name: str,
    ) -> None:
        name = self._validate_name(name)

        with self._lock:
            if name not in self._queues:
                raise KeyError(
                    f"queue not found: {name}"
                )

            self._schedulers[name].clear()

    def metrics(
        self,
        name: str | None = None,
    ) -> dict[str, QueueMetrics] | QueueMetrics:
        with self._lock:
            if name is not None:
                name = self._validate_name(name)

                if name not in self._queues:
                    raise KeyError(
                        f"queue not found: {name}"
                    )

                state = self._queues[name]

                return QueueMetrics(
                    name=name,
                    size=self._schedulers[
                        name
                    ].size,
                    enqueued=state.enqueued,
                    dequeued=state.dequeued,
                )

            return {
                queue_name: QueueMetrics(
                    name=queue_name,
                    size=self._schedulers[
                        queue_name
                    ].size,
                    enqueued=state.enqueued,
                    dequeued=state.dequeued,
                )
                for queue_name, state
                in self._queues.items()
            }

    def names(self) -> tuple[str, ...]:
        with self._lock:
            return tuple(
                self._queues.keys()
            )

    def contains(
        self,
        name: str,
    ) -> bool:
        name = self._validate_name(name)

        with self._lock:
            return name in self._queues

    def size(
        self,
        name: str,
    ) -> int:
        name = self._validate_name(name)

        with self._lock:
            if name not in self._queues:
                raise KeyError(
                    f"queue not found: {name}"
                )

            return self._schedulers[name].size

    def clear_all(self) -> None:
        with self._lock:
            for scheduler in (
                self._schedulers.values()
            ):
                scheduler.clear()

    def close(self) -> None:
        with self._lock:
            self._queues.clear()
            self._schedulers.clear()
