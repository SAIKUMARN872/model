"""
Task definitions and task execution support.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Awaitable, Callable

from .utils import (
    generate_id,
    utc_now,
    validate_name,
)


class TaskStatus(str, Enum):
    """Task lifecycle states."""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class AutomationTask:
    """Represents one browser automation task."""

    name: str

    action: Callable[
        [], Awaitable[Any]
    ]

    task_id: str = field(
        default_factory=lambda:
        generate_id("task")
    )

    status: TaskStatus = TaskStatus.PENDING

    result: Any = None

    error: str | None = None

    created_at: Any = field(
        default_factory=utc_now
    )

    started_at: Any = None

    completed_at: Any = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        self.name = validate_name(
            self.name
        )

        if not callable(self.action):
            raise TypeError(
                "Task action must be callable."
            )


class TaskExecutor:
    """
    Executes automation tasks sequentially
    or concurrently.
    """

    async def execute(
        self,
        task: AutomationTask,
    ) -> AutomationTask:

        if task.status == TaskStatus.CANCELLED:
            return task

        task.status = TaskStatus.RUNNING
        task.started_at = utc_now()

        try:

            task.result = await task.action()

            task.status = (
                TaskStatus.COMPLETED
            )

        except asyncio.CancelledError:

            task.status = (
                TaskStatus.CANCELLED
            )

            raise

        except Exception as exc:

            task.status = (
                TaskStatus.FAILED
            )

            task.error = str(exc)

        finally:

            task.completed_at = utc_now()

        return task

    async def execute_many(
        self,
        tasks: list[AutomationTask],
        concurrent: bool = False,
    ) -> list[AutomationTask]:

        if not tasks:
            return []

        if concurrent:

            return list(
                await asyncio.gather(
                    *[
                        self.execute(task)
                        for task in tasks
                    ]
                )
            )

        results = []

        for task in tasks:

            results.append(
                await self.execute(task)
            )

        return results

    def cancel(
        self,
        task: AutomationTask,
    ) -> None:

        if task.status in (
            TaskStatus.PENDING,
            TaskStatus.RUNNING,
        ):

            task.status = (
                TaskStatus.CANCELLED
            )


class TaskQueue:
    """In-memory task queue."""

    def __init__(self) -> None:

        self._tasks: dict[
            str,
            AutomationTask,
        ] = {}

    def add(
        self,
        task: AutomationTask,
    ) -> str:

        self._tasks[
            task.task_id
        ] = task

        return task.task_id

    def get(
        self,
        task_id: str,
    ) -> AutomationTask | None:

        return self._tasks.get(
            task_id
        )

    def remove(
        self,
        task_id: str,
    ) -> AutomationTask | None:

        return self._tasks.pop(
            task_id,
            None,
        )

    def all(
        self,
    ) -> list[AutomationTask]:

        return list(
            self._tasks.values()
        )

    def pending(
        self,
    ) -> list[AutomationTask]:

        return [
            task
            for task in self._tasks.values()
            if task.status
            == TaskStatus.PENDING
        ]

    def clear(self) -> None:

        self._tasks.clear()

    def __len__(self) -> int:
        return len(
            self._tasks
        )