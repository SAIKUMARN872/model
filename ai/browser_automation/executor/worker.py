"""
Background execution worker.
"""

from __future__ import annotations

import asyncio
from typing import Any

from .executor import (
    ExecutionResult,
    ExecutionTask,
    TaskExecutor,
)


class ExecutionWorker:
    """
    Background worker that processes execution tasks
    from an asyncio queue.
    """

    def __init__(
        self,
        executor: TaskExecutor | None = None,
    ) -> None:

        self.executor = (
            executor
            or TaskExecutor()
        )

        self.queue: asyncio.Queue[
            ExecutionTask | None
        ] = asyncio.Queue()

        self.results: dict[
            str,
            ExecutionResult,
        ] = {}

        self._worker_task: (
            asyncio.Task | None
        ) = None

        self._running = False

    async def start(
        self,
    ) -> None:

        if self._running:
            return

        self._running = True

        self._worker_task = (
            asyncio.create_task(
                self._run()
            )
        )

    async def _run(
        self,
    ) -> None:

        while self._running:

            task = await self.queue.get()

            try:

                if task is None:
                    break

                result = (
                    await self.executor.execute(
                        task
                    )
                )

                self.results[
                    task.task_id
                ] = result

            finally:

                self.queue.task_done()

    async def submit(
        self,
        task: ExecutionTask,
    ) -> str:

        if not self._running:

            await self.start()

        await self.queue.put(
            task
        )

        return task.task_id

    async def wait(
        self,
    ) -> None:

        await self.queue.join()

    def get_result(
        self,
        task_id: str,
    ) -> ExecutionResult | None:

        return self.results.get(
            task_id
        )

    async def stop(
        self,
    ) -> None:

        if not self._running:
            return

        self._running = False

        await self.queue.put(
            None
        )

        if self._worker_task:

            try:

                await self._worker_task

            except asyncio.CancelledError:
                pass

        self._worker_task = None

    @property
    def running(
        self,
    ) -> bool:

        return self._running