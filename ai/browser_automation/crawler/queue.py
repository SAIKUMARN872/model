"""
URL crawling queue.
"""

from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from threading import RLock


@dataclass
class CrawlItem:
    """A URL waiting to be crawled."""

    url: str
    depth: int = 0
    parent_url: str | None = None


class CrawlQueue:
    """
    Thread-safe FIFO crawl queue.

    Duplicate URLs are prevented automatically.
    """

    def __init__(
        self,
        max_size: int | None = None,
    ) -> None:

        self.max_size = max_size

        self._queue: deque[
            CrawlItem
        ] = deque()

        self._queued: set[str] = set()

        self._visited: set[str] = set()

        self._lock = RLock()

    def put(
        self,
        item: CrawlItem,
    ) -> bool:

        with self._lock:

            if item.url in self._visited:
                return False

            if item.url in self._queued:
                return False

            if (
                self.max_size is not None
                and len(self._queue)
                >= self.max_size
            ):
                return False

            self._queue.append(item)

            self._queued.add(
                item.url
            )

            return True

    def get(
        self,
    ) -> CrawlItem | None:

        with self._lock:

            if not self._queue:
                return None

            item = self._queue.popleft()

            self._queued.discard(
                item.url
            )

            return item

    def mark_visited(
        self,
        url: str,
    ) -> None:

        with self._lock:

            self._visited.add(
                url
            )

    def is_visited(
        self,
        url: str,
    ) -> bool:

        with self._lock:

            return url in self._visited

    def is_queued(
        self,
        url: str,
    ) -> bool:

        with self._lock:

            return url in self._queued

    def pending(
        self,
    ) -> int:

        with self._lock:

            return len(
                self._queue
            )

    def visited_count(
        self,
    ) -> int:

        with self._lock:

            return len(
                self._visited
            )

    def empty(
        self,
    ) -> bool:

        return self.pending() == 0

    def clear(
        self,
    ) -> None:

        with self._lock:

            self._queue.clear()
            self._queued.clear()
            self._visited.clear()

    def visited_urls(
        self,
    ) -> list[str]:

        with self._lock:

            return list(
                self._visited
            )