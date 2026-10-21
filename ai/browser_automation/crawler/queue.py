from __future__ import annotations

from dataclasses import dataclass
from collections import deque
from typing import Iterable

from ..schemas import validate_url


@dataclass(frozen=True)
class CrawlQueueItem:
    url: str
    depth: int = 0

    def __post_init__(self) -> None:
        validate_url(self.url)
        if isinstance(self.depth, bool) or not isinstance(self.depth, int) or self.depth < 0:
            raise ValueError("Crawl depth must be a non-negative integer.")


class CrawlQueue:
    """FIFO URL queue with deduplication and an optional size limit."""

    def __init__(self, max_size: int = 1000) -> None:
        if isinstance(max_size, bool) or not isinstance(max_size, int) or max_size < 1:
            raise ValueError("max_size must be a positive integer.")
        self.max_size = max_size
        self._items: deque[CrawlQueueItem] = deque()
        self._known: set[str] = set()

    def enqueue(self, url: str, depth: int = 0) -> bool:
        item = CrawlQueueItem(url=url, depth=depth)
        if item.url in self._known:
            return False
        if len(self._items) >= self.max_size:
            raise OverflowError("Crawl queue reached its maximum size.")

        self._items.append(item)
        self._known.add(item.url)
        return True

    def enqueue_many(self, urls: Iterable[str], depth: int = 0) -> int:
        added = 0
        for url in urls:
            if self.enqueue(url, depth=depth):
                added += 1
        return added

    def dequeue(self) -> CrawlQueueItem | None:
        if not self._items:
            return None
        return self._items.popleft()

    def mark_seen(self, url: str) -> None:
        self._known.add(validate_url(url))

    def __len__(self) -> int:
        return len(self._items)

    def __bool__(self) -> bool:
        return bool(self._items)
