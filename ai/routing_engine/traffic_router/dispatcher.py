from __future__ import annotations

from dataclasses import dataclass
from threading import Lock
from typing import Awaitable, Callable

from ai.routing_engine.models import ModelCandidate

from .queues import PriorityQueue, QueueItem, QueuePriority


@dataclass(frozen=True)
class DispatchRequest:
    """A request waiting to be dispatched to a selected model."""

    request_id: str
    candidate: ModelCandidate
    payload: object
    priority: QueuePriority = QueuePriority.NORMAL


@dataclass(frozen=True)
class DispatchResult:
    """Result returned after dispatch."""

    request_id: str
    model_id: str
    provider: str
    accepted: bool
    queued: bool
    reason: str


DispatchHandler = Callable[
    [DispatchRequest],
    Awaitable[object],
]


class RequestDispatcher:
    """Queue and concurrency controller for selected routing targets."""

    def __init__(
        self,
        max_concurrency: int = 100,
    ) -> None:
        if not isinstance(max_concurrency, int):
            raise TypeError("max_concurrency must be an integer")

        if max_concurrency <= 0:
            raise ValueError(
                "max_concurrency must be greater than zero"
            )

        self._max_concurrency = max_concurrency
        self._active_requests = 0
        self._queue: PriorityQueue[DispatchRequest] = PriorityQueue()
        self._lock = Lock()

    @property
    def max_concurrency(self) -> int:
        return self._max_concurrency

    @property
    def active_requests(self) -> int:
        with self._lock:
            return self._active_requests

    @property
    def queued_requests(self) -> int:
        return self._queue.qsize()

    @property
    def available_slots(self) -> int:
        with self._lock:
            return max(
                0,
                self._max_concurrency - self._active_requests,
            )

    def submit(
        self,
        request: DispatchRequest,
    ) -> DispatchResult:
        if not isinstance(request, DispatchRequest):
            raise TypeError(
                "request must be a DispatchRequest"
            )

        if not request.request_id.strip():
            raise ValueError(
                "request_id must be non-empty"
            )

        with self._lock:
            if self._active_requests < self._max_concurrency:
                self._active_requests += 1

                return DispatchResult(
                    request_id=request.request_id,
                    model_id=request.candidate.model_id,
                    provider=request.candidate.provider,
                    accepted=True,
                    queued=False,
                    reason="accepted",
                )

        self._queue.put(
            request.payload if False else request,
            request.priority,
        )

        return DispatchResult(
            request_id=request.request_id,
            model_id=request.candidate.model_id,
            provider=request.candidate.provider,
            accepted=True,
            queued=True,
            reason="queued",
        )

    def release(self) -> DispatchRequest | None:
        with self._lock:
            if self._active_requests > 0:
                self._active_requests -= 1

        next_item = self._queue.get()

        if next_item is None:
            return None

        with self._lock:
            self._active_requests += 1

        return next_item.payload

    def cancel_queued(
        self,
        request_id: str,
    ) -> bool:
        if not request_id.strip():
            raise ValueError(
                "request_id must be non-empty"
            )

        retained: list[QueueItem[DispatchRequest]] = []
        removed = False

        while True:
            item = self._queue.get()

            if item is None:
                break

            if (
                not removed
                and item.payload.request_id == request_id
            ):
                removed = True
                continue

            retained.append(item)

        for item in retained:
            self._queue.put(
                item.payload,
                item.priority,
            )

        return removed

    def clear(self) -> int:
        return self._queue.clear()


__all__ = [
    "DispatchHandler",
    "DispatchRequest",
    "DispatchResult",
    "RequestDispatcher",
]
