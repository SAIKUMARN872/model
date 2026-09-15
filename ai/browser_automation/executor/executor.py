"""
Central task executor.
"""

from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Awaitable, Callable

from .utils import (
    build_execution_result,
    execute_with_timeout,
    retry,
)


class ExecutionStatus(
    str,
    Enum,
):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    TIMEOUT = "timeout"


@dataclass
class ExecutionTask:
    """Task submitted to the executor."""

    action: Callable[
        [], Awaitable[Any]
    ]

    task_id: str

    name: str = "task"

    timeout: float | None = None

    retries: int = 0

    retry_delay: float = 1.0

    status: ExecutionStatus = (
        ExecutionStatus.PENDING
    )

    result: Any = None

    error: str | None = None

    duration: float = 0.0

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


@dataclass
class ExecutionResult:
    """Execution result."""

    task_id: str

    status: ExecutionStatus

    success: bool

    result: Any = None

    error: str | None = None

    duration: float = 0.0

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


class TaskExecutor:
    """
    Executes asynchronous automation tasks.
    """

    def __init__(
        self,
        max_concurrency: int = 4,
    ) -> None:

        if max_concurrency <= 0:

            raise ValueError(
                "max_concurrency must be positive."
            )

        self.max_concurrency = (
            max_concurrency
        )

        self._semaphore = (
            asyncio.Semaphore(
                max_concurrency
            )
        )

        self._running: dict[
            str,
            asyncio.Task,
        ] = {}

    async def execute(
        self,
        task: ExecutionTask,
    ) -> ExecutionResult:

        started = time.monotonic()

        task.status = (
            ExecutionStatus.RUNNING
        )

        async with self._semaphore:

            try:

                async def operation():

                    return await execute_with_timeout(
                        task.action,
                        task.timeout,
                    )

                result = await retry(
                    operation,
                    retries=task.retries,
                    delay=task.retry_delay,
                )

                task.result = result

                task.status = (
                    ExecutionStatus.COMPLETED
                )

                task.duration = (
                    time.monotonic()
                    - started
                )

                return ExecutionResult(
                    task_id=task.task_id,
                    status=task.status,
                    success=True,
                    result=result,
                    duration=task.duration,
                    metadata=task.metadata,
                )

            except asyncio.TimeoutError:

                task.status = (
                    ExecutionStatus.TIMEOUT
                )

                task.error = (
                    "Task execution timed out."
                )

            except asyncio.CancelledError:

                task.status = (
                    ExecutionStatus.CANCELLED
                )

                task.error = (
                    "Task was cancelled."
                )

                raise

            except Exception as exc:

                task.status = (
                    ExecutionStatus.FAILED
                )

                task.error = str(exc)

            task.duration = (
                time.monotonic()
                - started
            )

            return ExecutionResult(
                task_id=task.task_id,
                status=task.status,
                success=False,
                error=task.error,
                duration=task.duration,
                metadata=task.metadata,
            )

    async def execute_many(
        self,
        tasks: list[ExecutionTask],
    ) -> list[ExecutionResult]:

        if not tasks:
            return []

        return list(
            await asyncio.gather(
                *[
                    self.execute(task)
                    for task in tasks
                ]
            )
        )

    async def submit(
        self,
        task: ExecutionTask,
    ) -> ExecutionResult:

        current = asyncio.create_task(
            self.execute(task)
        )

        self._running[
            task.task_id
        ] = current

        try:

            return await current

        finally:

            self._running.pop(
                task.task_id,
                None,
            )

    def cancel(
        self,
        task_id: str,
    ) -> bool:

        task = self._running.get(
            task_id
        )

        if task is None:
            return False

        return task.cancel()

    def running_tasks(
        self,
    ) -> list[str]:

        return list(
            self._running.keys()
        )