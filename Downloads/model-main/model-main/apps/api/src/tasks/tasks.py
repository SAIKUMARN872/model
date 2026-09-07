"""
Task base module.

Provides a reusable task abstraction for
background jobs and asynchronous workers.
"""

from __future__ import annotations

import asyncio
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any
from uuid import UUID, uuid4

from app.core.logging import logger


class BaseTask(ABC):
    """
    Base background task.

    All background tasks should inherit
    from this class.
    """

    def __init__(
        self,
        name: str,
    ) -> None:

        self.id: UUID = uuid4()

        self.name = name

        self.created_at = datetime.now(
            timezone.utc,
        )

        self.status = "pending"

        self.result: Any = None

        self.error: Exception | None = None


    async def execute(
        self,
        *args,
        **kwargs,
    ) -> Any:
        """
        Execute task lifecycle.
        """

        try:

            self.status = "running"

            logger.info(
                "Task started: %s",
                self.name,
            )


            self.result = await self.run(
                *args,
                **kwargs,
            )


            self.status = "completed"


            logger.info(
                "Task completed: %s",
                self.name,
            )


            return self.result


        except Exception as exc:

            self.status = "failed"

            self.error = exc


            logger.exception(
                "Task failed: %s",
                self.name,
                exc_info=exc,
            )

            raise exc


    @abstractmethod
    async def run(
        self,
        *args,
        **kwargs,
    ) -> Any:
        """
        Task implementation.

        Must be implemented by child classes.
        """

        raise NotImplementedError



class AsyncTaskRunner:
    """
    Async task runner.

    Executes background tasks.
    """

    def __init__(self) -> None:

        self.tasks: dict[UUID, BaseTask] = {}


    async def submit(
        self,
        task: BaseTask,
        *args,
        **kwargs,
    ) -> UUID:
        """
        Submit task for execution.
        """

        self.tasks[task.id] = task


        asyncio.create_task(
            task.execute(
                *args,
                **kwargs,
            )
        )


        return task.id


    def get_task(
        self,
        task_id: UUID,
    ) -> BaseTask | None:
        """
        Get task status.
        """

        return self.tasks.get(
            task_id,
        )


    def status(
        self,
        task_id: UUID,
    ) -> dict[str, Any] | None:
        """
        Return task information.
        """

        task = self.get_task(
            task_id,
        )


        if not task:
            return None


        return {
            "id": str(task.id),
            "name": task.name,
            "status": task.status,
            "created_at": task.created_at,
            "result": task.result,
            "error": str(task.error)
            if task.error
            else None,
        }