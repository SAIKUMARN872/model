"""
Queue Adapter

Enterprise Queue Adapter

Responsibilities
----------------
- Publish Tasks
- Execute Background Jobs
- Schedule Tasks
- Task Status
"""

from __future__ import annotations

from typing import Any

from celery import Celery

from config.logging import log
from config.settings import settings


class QueueAdapter:
    """
    Enterprise Queue Adapter.
    """

    def __init__(self) -> None:

        self.app = Celery(
            "modelnow",
            broker=settings.CELERY_BROKER_URL,
            backend=settings.CELERY_RESULT_BACKEND,
        )

    # ==========================================================
    # Send Task
    # ==========================================================

    async def send_task(
        self,
        task_name: str,
        *args: Any,
        **kwargs: Any,
    ) -> str:

        task = self.app.send_task(
            task_name,
            args=args,
            kwargs=kwargs,
        )

        log.info(
            f"Task submitted: {task_name} ({task.id})"
        )

        return task.id

    # ==========================================================
    # Schedule Task
    # ==========================================================

    async def schedule_task(
        self,
        task_name: str,
        countdown: int = 60,
        *args: Any,
        **kwargs: Any,
    ) -> str:

        task = self.app.send_task(
            task_name,
            args=args,
            kwargs=kwargs,
            countdown=countdown,
        )

        log.info(
            f"Scheduled task: {task_name} ({task.id})"
        )

        return task.id

    # ==========================================================
    # Get Task Status
    # ==========================================================

    async def task_status(
        self,
        task_id: str,
    ) -> dict[str, Any]:

        result = self.app.AsyncResult(task_id)

        return {
            "task_id": task.id,
            "status": result.status,
            "successful": result.successful(),
            "failed": result.failed(),
            "ready": result.ready(),
            "result": result.result if result.ready() else None,
        }

    # ==========================================================
    # Revoke Task
    # ==========================================================

    async def revoke(
        self,
        task_id: str,
        terminate: bool = False,
    ) -> None:

        self.app.control.revoke(
            task_id,
            terminate=terminate,
        )

        log.info(f"Task revoked: {task_id}")

    # ==========================================================
    # Health Check
    # ==========================================================

    async def health(self) -> bool:

        try:

            self.app.control.ping()

            return True

        except Exception as exc:

            log.exception(
                "Queue health check failed.",
                error=str(exc),
            )

            return False

    # ==========================================================
    # Purge Queue
    # ==========================================================

    async def purge(self) -> int:

        count = self.app.control.purge()

        log.info(f"Purged {count} queued tasks.")

        return count 