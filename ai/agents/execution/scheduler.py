from __future__ import annotations

import asyncio
from collections.abc import Awaitable, Callable
from typing import TypeVar

T = TypeVar("T")


class AgentScheduler:
    """Schedules independent asynchronous tasks with bounded concurrency."""

    def __init__(self, max_concurrency: int = 4) -> None:
        if max_concurrency < 1:
            raise ValueError("max_concurrency must be at least one")
        self.max_concurrency = max_concurrency

    async def run_many(
        self,
        tasks: list[Callable[[], Awaitable[T]]],
    ) -> list[T]:
        semaphore = asyncio.Semaphore(self.max_concurrency)

        async def run_one(task: Callable[[], Awaitable[T]]) -> T:
            async with semaphore:
                return await task()

        return await asyncio.gather(*(run_one(task) for task in tasks))


__all__ = ["AgentScheduler"]
