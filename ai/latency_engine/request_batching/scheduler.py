from __future__ import annotations

from dataclasses import dataclass, field
from threading import RLock
from typing import Any

from .batcher import RequestBatch, RequestBatcher
from .utils import (
    DEFAULT_MAX_BATCH_SIZE,
    DEFAULT_MAX_WAIT_MS,
    DEFAULT_MAX_TOKENS,
    validate_wait_ms,
)


@dataclass(frozen=True)
class BatchScheduleState:
    first_queued_at: float | None
    size: int
    total_tokens: int
    max_batch_size: int
    max_tokens: int
    max_wait_ms: float

    @property
    def waiting_ms(self) -> float:
        if self.first_queued_at is None:
            return 0.0

        import time

        return max(
            0.0,
            (time.time() - self.first_queued_at) * 1000.0,
        )


class BatchScheduler:
    def __init__(
        self,
        batcher: RequestBatcher | None = None,
        *,
        max_batch_size: int = DEFAULT_MAX_BATCH_SIZE,
        max_tokens: int = DEFAULT_MAX_TOKENS,
        max_wait_ms: float = DEFAULT_MAX_WAIT_MS,
    ) -> None:
        self._batcher = batcher or RequestBatcher(
            max_batch_size=max_batch_size,
            max_tokens=max_tokens,
        )

        self._max_wait_ms = validate_wait_ms(
            max_wait_ms
        )

        self._lock = RLock()
        self._first_queued_at: float | None = None

    @property
    def batcher(self) -> RequestBatcher:
        return self._batcher

    @property
    def max_wait_ms(self) -> float:
        return self._max_wait_ms

    @property
    def size(self) -> int:
        return self._batcher.size

    @property
    def total_tokens(self) -> int:
        return self._batcher.total_tokens

    @property
    def empty(self) -> bool:
        return self._batcher.empty

    def add(
        self,
        request_id: str,
        payload: Any,
        *,
        metadata: dict[str, object] | None = None,
        queued_at: float | None = None,
    ):
        import time

        timestamp = (
            time.time()
            if queued_at is None
            else float(queued_at)
        )

        with self._lock:
            if self._batcher.empty:
                self._first_queued_at = timestamp

            return self._batcher.add(
                request_id,
                payload,
                metadata=metadata,
            )

    def should_flush(
        self,
        *,
        current_time: float | None = None,
    ) -> bool:
        import time

        with self._lock:
            if self._batcher.empty:
                return False

            if self._batcher.size >= (
                self._batcher.max_batch_size
            ):
                return True

            if self._batcher.total_tokens >= (
                self._batcher.max_tokens
            ):
                return True

            if self._first_queued_at is None:
                return False

            timestamp = (
                time.time()
                if current_time is None
                else float(current_time)
            )

            elapsed_ms = max(
                0.0,
                (timestamp - self._first_queued_at) * 1000.0,
            )

            return elapsed_ms >= self._max_wait_ms

    def flush(
        self,
        *,
        batch_id: str | None = None,
        metadata: dict[str, object] | None = None,
    ) -> RequestBatch:
        with self._lock:
            batch = self._batcher.flush(
                batch_id=batch_id,
                metadata=metadata,
            )
            self._first_queued_at = None
            return batch

    def state(
        self,
        *,
        current_time: float | None = None,
    ) -> BatchScheduleState:
        import time

        with self._lock:
            waiting_ms = 0.0

            if self._first_queued_at is not None:
                timestamp = (
                    time.time()
                    if current_time is None
                    else float(current_time)
                )

                waiting_ms = max(
                    0.0,
                    (
                        timestamp
                        - self._first_queued_at
                    ) * 1000.0,
                )

            return BatchScheduleState(
                first_queued_at=self._first_queued_at,
                size=self._batcher.size,
                total_tokens=self._batcher.total_tokens,
                max_batch_size=self._batcher.max_batch_size,
                max_tokens=self._batcher.max_tokens,
                max_wait_ms=self._max_wait_ms,
            )

    def clear(self) -> None:
        with self._lock:
            self._batcher.clear()
            self._first_queued_at = None


__all__ = [
    "BatchScheduleState",
    "BatchScheduler",
]
