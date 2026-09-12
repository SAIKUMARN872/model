"""
Asynchronous embedding batch scheduler.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Any

from .batcher import (
    BatcherConfig,
    EmbeddingBatcher,
)
from .queue import (
    EmbeddingQueue,
    EmbeddingRequest,
    QueueClosedError,
)
from .utils import (
    estimate_item_tokens,
    normalize_timeout,
)


class SchedulerError(Exception):
    """Base scheduler exception."""


class SchedulerNotRunningError(
    SchedulerError
):
    """Raised when scheduling is attempted while stopped."""


@dataclass
class SchedulerConfig:
    """
    Configuration for the batch scheduler.
    """

    batch_size: int = 32

    max_wait_ms: float = 50.0

    max_queue_size: int = 10000

    batch_tokens: int | None = None

    timeout: float | None = 30.0

    max_retries: int = 2

    retry_delay: float = 0.5

    workers: int = 1

    def __post_init__(self) -> None:

        if self.batch_size <= 0:

            raise ValueError(
                "batch_size must be positive"
            )

        if self.max_wait_ms < 0:

            raise ValueError(
                "max_wait_ms cannot be negative"
            )

        if self.max_queue_size <= 0:

            raise ValueError(
                "max_queue_size must be positive"
            )

        if (
            self.batch_tokens is not None
            and self.batch_tokens <= 0
        ):

            raise ValueError(
                "batch_tokens must be positive"
            )

        if self.workers <= 0:

            raise ValueError(
                "workers must be positive"
            )


class EmbeddingScheduler:
    """
    Coordinates queue -> batcher -> embedding provider.

    Requests are processed when:

        1. batch_size is reached, or
        2. max_wait_ms expires.

    Multiple workers can process batches concurrently.
    """

    def __init__(
        self,
        embedding_function,
        config: SchedulerConfig | None = None,
    ) -> None:

        self.config = (
            config
            or SchedulerConfig()
        )

        self.queue = EmbeddingQueue(
            max_size=self.config.max_queue_size
        )

        self.batcher = EmbeddingBatcher(
            embedding_function=embedding_function,
            config=BatcherConfig(
                max_batch_size=(
                    self.config.batch_size
                ),
                max_batch_tokens=(
                    self.config.batch_tokens
                ),
                timeout=self.config.timeout,
                max_retries=(
                    self.config.max_retries
                ),
                retry_delay=(
                    self.config.retry_delay
                ),
            ),
        )

        self._running = False

        self._workers: list[
            asyncio.Task
        ] = []

        self._active_batches = 0

        self._processed_requests = 0

        self._failed_requests = 0

        self._processed_batches = 0

        self._failed_batches = 0

        self._stop_event = asyncio.Event()

    # --------------------------------------------------
    # Lifecycle
    # --------------------------------------------------

    async def start(self) -> None:

        if self._running:
            return

        self._running = True

        self._stop_event.clear()

        self._workers = [
            asyncio.create_task(
                self._worker_loop()
            )
            for _ in range(
                self.config.workers
            )
        ]

    async def stop(
        self,
        wait: bool = True,
    ) -> None:

        if not self._running:
            return

        self._running = False

        self._stop_event.set()

        self.queue.close()

        if wait:

            await self.queue.join()

        for worker in self._workers:

            if not worker.done():

                worker.cancel()

        if self._workers:

            await asyncio.gather(
                *self._workers,
                return_exceptions=True,
            )

        self._workers.clear()

    async def _worker_loop(
        self,
    ) -> None:

        while self._running:

            try:

                first_request = (
                    await self._get_request()
                )

            except (
                QueueClosedError,
                asyncio.CancelledError,
            ):

                break

            if first_request is None:
                continue

            requests = [
                first_request
            ]

            deadline = (
                asyncio.get_running_loop()
                .time()
                + (
                    self.config.max_wait_ms
                    / 1000.0
                )
            )

            while (
                len(requests)
                < self.config.batch_size
            ):

                remaining = (
                    deadline
                    - asyncio.get_running_loop().time()
                )

                if remaining <= 0:
                    break

                try:

                    request = await asyncio.wait_for(
                        self.queue.get(),
                        timeout=remaining,
                    )

                    requests.append(
                        request
                    )

                except asyncio.TimeoutError:

                    break

                except QueueClosedError:

                    break

            batches = (
                self.batcher.split_requests(
                    requests
                )
            )

            for batch in batches:

                self._active_batches += 1

                try:

                    result = (
                        await self.batcher.execute(
                            batch
                        )
                    )

                    self._processed_batches += 1

                    if result.success:

                        self._processed_requests += (
                            result.request_count
                        )

                    else:

                        self._failed_batches += 1

                        self._failed_requests += (
                            result.request_count
                        )

                finally:

                    self._active_batches -= 1

                    for _ in batch.requests:

                        self.queue.task_done()

    async def _get_request(
        self,
    ) -> EmbeddingRequest | None:

        try:

            return await self.queue.get()

        except QueueClosedError:

            return None

    # --------------------------------------------------
    # Submission
    # --------------------------------------------------

    async def submit(
        self,
        text: Any,
        priority: int = 0,
        metadata: dict[str, Any] | None = None,
    ) -> list[float]:

        if not self._running:

            raise SchedulerNotRunningError(
                "Embedding scheduler is not running"
            )

        loop = asyncio.get_running_loop()

        future = loop.create_future()

        request = EmbeddingRequest(
            text=text,
            future=future,
            priority=priority,
            token_count=estimate_item_tokens(
                text
            ),
            metadata=metadata or {},
        )

        await self.queue.put(
            request
        )

        return await future

    async def submit_many(
        self,
        texts: list[Any],
        priority: int = 0,
        metadata: dict[str, Any] | None = None,
    ) -> list[list[float]]:

        if not texts:
            return []

        tasks = [
            self.submit(
                text=text,
                priority=priority,
                metadata=metadata,
            )
            for text in texts
        ]

        return await asyncio.gather(
            *tasks
        )

    # --------------------------------------------------
    # Status
    # --------------------------------------------------

    @property
    def running(self) -> bool:

        return self._running

    def status(self) -> dict[str, Any]:

        return {
            "running": self._running,
            "queue_size": self.queue.qsize(),
            "active_batches": (
                self._active_batches
            ),
            "processed_requests": (
                self._processed_requests
            ),
            "failed_requests": (
                self._failed_requests
            ),
            "processed_batches": (
                self._processed_batches
            ),
            "failed_batches": (
                self._failed_batches
            ),
            "workers": self.config.workers,
            "batch_size": self.config.batch_size,
            "max_wait_ms": self.config.max_wait_ms,
        }