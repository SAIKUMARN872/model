from __future__ import annotations

from dataclasses import dataclass, field
from time import time
from typing import Generic, TypeVar

from .priority_queue import PriorityQueue
from .utils import (
    aging_priority,
    calculate_wait_time_ms,
    normalize_priority,
)


T = TypeVar("T")


@dataclass(frozen=True)
class ScheduledItem(Generic[T]):
    value: T
    priority: int
    queued_at: float
    metadata: dict[str, object] = field(
        default_factory=dict
    )


class QueueScheduler(Generic[T]):
    def __init__(
        self,
        *,
        aging_enabled: bool = True,
        aging_interval_ms: float = 1000.0,
    ) -> None:
        if aging_interval_ms <= 0.0:
            raise ValueError(
                "aging_interval_ms must be positive"
            )

        self.aging_enabled = aging_enabled
        self.aging_interval_ms = (
            aging_interval_ms
        )

        self._queue: PriorityQueue[
            ScheduledItem[T]
        ] = PriorityQueue()

    def schedule(
        self,
        value: T,
        *,
        priority: int | str = 50,
        queued_at: float | None = None,
        metadata: dict[str, object] | None = None,
    ) -> ScheduledItem[T]:
        normalized_priority = normalize_priority(
            priority
        )

        timestamp = (
            time()
            if queued_at is None
            else float(queued_at)
        )

        if timestamp < 0.0:
            raise ValueError(
                "queued_at must be nonnegative"
            )

        item = ScheduledItem(
            value=value,
            priority=normalized_priority,
            queued_at=timestamp,
            metadata=dict(
                metadata or {}
            ),
        )

        self._queue.put(
            item,
            priority=normalized_priority,
        )

        return item

    def next(
        self,
        *,
        current_time: float | None = None,
    ) -> ScheduledItem[T]:
        item = self._queue.get_item().value

        if not self.aging_enabled:
            return item

        timestamp = (
            time()
            if current_time is None
            else float(current_time)
        )

        wait_time = calculate_wait_time_ms(
            queued_at=item.queued_at,
            current_time=timestamp,
        )

        effective_priority = aging_priority(
            item.priority,
            wait_time_ms=wait_time,
            aging_interval_ms=(
                self.aging_interval_ms
            ),
        )

        if effective_priority == item.priority:
            return item

        return ScheduledItem(
            value=item.value,
            priority=effective_priority,
            queued_at=item.queued_at,
            metadata={
                **item.metadata,
                "original_priority": item.priority,
                "wait_time_ms": wait_time,
            },
        )

    def peek(
        self,
    ) -> ScheduledItem[T]:
        return self._queue.peek()

    def clear(self) -> None:
        self._queue.clear()

    @property
    def size(self) -> int:
        return self._queue.size

    @property
    def empty(self) -> bool:
        return self._queue.empty

    def wait_time_ms(
        self,
        item: ScheduledItem[T],
        *,
        current_time: float | None = None,
    ) -> float:
        timestamp = (
            time()
            if current_time is None
            else float(current_time)
        )

        return calculate_wait_time_ms(
            queued_at=item.queued_at,
            current_time=timestamp,
        )
