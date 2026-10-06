from __future__ import annotations

from collections import deque

from ai.inference_engine.models import InferenceRequest


class InferenceQueue:
    """FIFO queue for pending inference requests."""

    def __init__(self) -> None:
        self._queue: deque[InferenceRequest] = deque()

    def put(self, request: InferenceRequest) -> None:
        self._queue.append(request)

    def get(self) -> InferenceRequest:
        if not self._queue:
            raise LookupError("Inference queue is empty.")

        return self._queue.popleft()

    def peek(self) -> InferenceRequest | None:
        if not self._queue:
            return None

        return self._queue[0]

    def clear(self) -> None:
        self._queue.clear()

    @property
    def size(self) -> int:
        return len(self._queue)

    def __len__(self) -> int:
        return len(self._queue)


__all__ = ["InferenceQueue"]
