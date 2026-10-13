from collections import deque
from threading import Lock
from typing import Generic, TypeVar

from ai.embeddings.exceptions import EmbeddingValidationError

T = TypeVar("T")


class EmbeddingQueue(Generic[T]):
    """Thread-safe FIFO queue for pending embedding work."""

    def __init__(self, max_size: int = 10000) -> None:
        if isinstance(max_size, bool) or not isinstance(max_size, int):
            raise EmbeddingValidationError("max_size must be an integer")
        if max_size < 1:
            raise EmbeddingValidationError("max_size must be positive")

        self.max_size = max_size
        self._items: deque[T] = deque()
        self._lock = Lock()

    def put(self, item: T) -> None:
        with self._lock:
            if len(self._items) >= self.max_size:
                raise OverflowError("Embedding queue is full")
            self._items.append(item)

    def get(self) -> T:
        with self._lock:
            if not self._items:
                raise IndexError("Embedding queue is empty")
            return self._items.popleft()

    def get_many(self, limit: int) -> list[T]:
        if isinstance(limit, bool) or not isinstance(limit, int):
            raise EmbeddingValidationError("limit must be an integer")
        if limit < 1:
            raise EmbeddingValidationError("limit must be positive")

        with self._lock:
            count = min(limit, len(self._items))
            return [self._items.popleft() for _ in range(count)]

    def clear(self) -> int:
        with self._lock:
            count = len(self._items)
            self._items.clear()
            return count

    def __len__(self) -> int:
        with self._lock:
            return len(self._items)

    def is_empty(self) -> bool:
        return len(self) == 0
