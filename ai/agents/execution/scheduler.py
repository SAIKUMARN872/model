"""
Task scheduler for ModelNow.

Supports:
    - run once after a delay
    - run at a specific datetime
    - recurring interval execution
    - cancellation
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Any, Callable
from uuid import uuid4

from .runner import ExecutionRunner


class SchedulerError(Exception):
    """Base scheduler exception."""


class ScheduledTaskNotFoundError(
    SchedulerError
):
    """Raised when a scheduled task is not found."""


@dataclass
class ScheduledTask:
    """
    Represents a scheduled task.
    """

    task_id: str

    name: str

    function: Callable[..., Any]

    run_at: datetime

    interval: float | None = None

    args: tuple[Any, ...] = ()

    kwargs: dict[str, Any] = field(
        default_factory=dict
    )

    repeat: bool = False

    cancelled: bool = False

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    created_at: datetime = field(
        default_factory=lambda: datetime.now(
            timezone.utc
        )
    )

    def cancel(self) -> None:

        self.cancelled = True

    @property
    def recurring(self) -> bool:

        return (
            self.repeat
            and self.interval is not None
        )

    def to_dict(self) -> dict[str, Any]:

        return {
            "task_id": self.task_id,
            "name": self.name,
            "run_at": self.run_at.isoformat(),
            "interval": self.interval,
            "repeat": self.repeat,
            "cancelled": self.cancelled,
            "recurring": self.recurring,
            "created_at": (
                self.created_at.isoformat()
            ),
            "metadata": dict(
                self.metadata
            ),
        }


class TaskScheduler:
    """
    Async task scheduler.

    The scheduler does not create a background thread
    automatically. Call `start()` to run the scheduler loop.
    """

    def __init__(
        self,
        runner: ExecutionRunner | None = None,
    ) -> None:

        self.runner = (
            runner
            or ExecutionRunner()
        )

        self._tasks: dict[
            str,
            ScheduledTask,
        ] = {}

        self._running = False

        self._scheduler_task: (
            asyncio.Task[Any] | None
        ) = None

    @property
    def running(self) -> bool:
        return self._running

    def schedule_once(
        self,
        name: str,
        function: Callable[..., Any],
        delay: float = 0.0,
        *args: Any,
        **kwargs: Any,
    ) -> str:
        """
        Schedule a function to execute once.
        """

        if delay < 0:
            raise ValueError(
                "delay cannot be negative"
            )

        run_at = (
            datetime.now(timezone.utc)
            + timedelta(
                seconds=delay
            )
        )

        return self.schedule_at(
            name=name,
            function=function,
            run_at=run_at,
            args=args,
            kwargs=kwargs,
        )

    def schedule_at(
        self,
        name: str,
        function: Callable[..., Any],
        run_at: datetime,
        args: tuple[Any, ...] = (),
        kwargs: dict[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> str:
        """
        Schedule a function at a specific datetime.
        """

        if not name.strip():
            raise ValueError(
                "Task name cannot be empty"
            )

        if not callable(function):
            raise TypeError(
                "function must be callable"
            )

        if run_at.tzinfo is None:

            run_at = run_at.replace(
                tzinfo=timezone.utc
            )

        task_id = str(uuid4())

        task = ScheduledTask(
            task_id=task_id,
            name=name,
            function=function,
            run_at=run_at,
            args=args,
            kwargs=kwargs or {},
            metadata=metadata or {},
        )

        self._tasks[
            task_id
        ] = task

        return task_id

    def schedule_interval(
        self,
        name: str,
        function: Callable[..., Any],
        interval: float,
        delay: float = 0.0,
        *args: Any,
        **kwargs: Any,
    ) -> str:
        """
        Schedule a recurring task.
        """

        if interval <= 0:
            raise ValueError(
                "interval must be greater than zero"
            )

        if delay < 0:
            raise ValueError(
                "delay cannot be negative"
            )

        run_at = (
            datetime.now(timezone.utc)
            + timedelta(
                seconds=delay
            )
        )

        task_id = str(uuid4())

        self._tasks[
            task_id
        ] = ScheduledTask(
            task_id=task_id,
            name=name,
            function=function,
            run_at=run_at,
            interval=interval,
            args=args,
            kwargs=kwargs,
            repeat=True,
        )

        return task_id

    def cancel(
        self,
        task_id: str,
    ) -> bool:

        task = self._tasks.get(
            task_id
        )

        if task is None:
            return False

        task.cancel()

        return True

    def get(
        self,
        task_id: str,
    ) -> ScheduledTask:

        task = self._tasks.get(
            task_id
        )

        if task is None:

            raise ScheduledTaskNotFoundError(
                f"Scheduled task not found: {task_id}"
            )

        return task

    def list_tasks(
        self,
    ) -> list[ScheduledTask]:

        return list(
            self._tasks.values()
        )

    async def start(self) -> None:
        """
        Start the scheduler loop.

        This method runs until `stop()` is called.
        """

        if self._running:
            return

        self._running = True

        self._scheduler_task = (
            asyncio.current_task()
        )

        try:

            while self._running:

                await self._process_tasks()

                await asyncio.sleep(
                    0.25
                )

        finally:

            self._running = False

    def stop(self) -> None:

        self._running = False

    async def run_pending(
        self,
    ) -> None:
        """
        Execute all currently due tasks.
        """

        await self._process_tasks()

    async def _process_tasks(
        self,
    ) -> None:

        now = datetime.now(
            timezone.utc
        )

        due_tasks = [
            task
            for task in self._tasks.values()
            if (
                not task.cancelled
                and task.run_at <= now
            )
        ]

        for task in due_tasks:

            if task.cancelled:
                continue

            try:

                await self.runner.run_function(
                    task.function,
                    *task.args,
                    **task.kwargs,
                )

            except Exception:
                # Scheduler continues processing other tasks.
                pass

            if (
                task.recurring
                and not task.cancelled
            ):

                task.run_at = (
                    task.run_at
                    + timedelta(
                        seconds=task.interval
                    )
                )

                # If execution was delayed significantly,
                # move the next execution into the future.
                if task.run_at <= now:

                    task.run_at = (
                        now
                        + timedelta(
                            seconds=task.interval
                        )
                    )

            else:

                self._tasks.pop(
                    task.task_id,
                    None,
                )

    def clear(self) -> None:

        self._tasks.clear()

    def status(self) -> dict[str, Any]:

        return {
            "running": self._running,
            "scheduled_count": len(
                self._tasks
            ),
            "tasks": [
                task.to_dict()
                for task in self._tasks.values()
            ],
        }