"""
Async priority queue for embedding requests.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4


class BatchQueueError(Exception):
    """Base exception for batch queue errors."""


class QueueClosedError(
    BatchQueueError
):
    """Raised when a request is submitted to a closed queue."""


@dataclass
class EmbeddingRequest:
    """
    One embedding request waiting to be batched.
    """

    text: Any

    future: asyncio.Future = field(
        repr=False
    )

    request_id: str = field(
        default_factory=lambda: str(uuid4())
    )

    priority: int = 0

    token_count: int = 0

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    created_at: datetime = field(
        default_factory=lambda: datetime.now(
            timezone.utc
        )
    )

    sequence: int = 0

    def __post_init__(self) -> None:

        if not isinstance(
            self.priority,
            int,
        ):

            raise TypeError(
                "priority must be an integer"
            )

        if self.token_count < 0:

            raise ValueError(
                "token_count cannot be negative"
            )

    def set_result(
        self,
        result: Any,
    ) -> None:

        if not self.future.done():

            self.future.set_result(
                result
            )

    def set_exception(
        self,
        error: Exception,
    ) -> None:

        if not self.future.done():

            self.future.set_exception(
                error
            )

    def cancel(self) -> bool:

        if self.future.done():
            return False

        return self.future.cancel()

    @property
    def done(self) -> bool:

        return self.future.done()

    @property
    def age_seconds(self) -> float:

        return (
            datetime.now(timezone.utc)
            - self.created_at
        ).total_seconds()


class EmbeddingQueue:
    """
    Priority-aware asynchronous queue.

    Higher priority values are processed first.
    FIFO ordering is preserved for equal priorities.
    """

    def __init__(
        self,
        max_size: int = 10000,
    ) -> None:

        if max_size <= 0:

            raise ValueError(
                "max_size must be positive"
            )

        self.max_size = max_size

        self._queue: asyncio.PriorityQueue[
            tuple[int, int, EmbeddingRequest]
        ] = asyncio.PriorityQueue(
            maxsize=max_size
        )

        self._sequence = 0

        self._closed = False

        self._lock = asyncio.Lock()

    async def put(
        self,
        request: EmbeddingRequest,
    ) -> None:

        async with self._lock:

            if self._closed:

                raise QueueClosedError(
                    "Embedding queue is closed"
                )

            self._sequence += 1

            request.sequence = (
                self._sequence
            )

            # Negative priority because PriorityQueue
            # returns the smallest value first.
            await self._queue.put(
                (
                    -request.priority,
                    request.sequence,
                    request,
                )
            )

    async def get(
        self,
    ) -> EmbeddingRequest:

        if self._closed and self._queue.empty():

            raise QueueClosedError(
                "Embedding queue is closed"
            )

        _, _, request = (
            await self._queue.get()
        )

        return request

    def task_done(self) -> None:

        self._queue.task_done()

    async def join(self) -> None:

        await self._queue.join()

    def qsize(self) -> int:

        return self._queue.qsize()

    def empty(self) -> bool:

        return self._queue.empty()

    def full(self) -> bool:

        return self._queue.full()

    def close(self) -> None:

        self._closed = True

    @property
    def closed(self) -> bool:

        return self._closed

    def pending_items(
        self,
    ) -> list[EmbeddingRequest]:
        """
        Return pending requests.

        Note: asyncio.PriorityQueue intentionally doesn't
        expose a public iterator, so this accesses its
        underlying heap for inspection only.
        """

        return [
            item[2]
            for item in list(
                self._queue._queue
            )
        ]

    async def cancel_pending(
        self,
        error: Exception | None = None,
    ) -> int:
        """
        Cancel all currently queued requests.
        """

        cancelled = 0

        while not self._queue.empty():

            try:

                request = await self.get()

            except QueueClosedError:

                break

            try:

                if not request.done:

                    if error:

                        request.set_exception(
                            error
                        )

                    else:

                        request.cancel()

                    cancelled += 1

            finally:

                self.task_done()

        return cancelled