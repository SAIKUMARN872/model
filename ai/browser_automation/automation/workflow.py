from typing import Any

from ..agents import BrowserAgent
from ..exceptions import BrowserActionError
from .tasks import AutomationTask, TaskStatus


class AutomationWorkflow:
    """Manage task lifecycle and sequential browser action execution."""

    def __init__(self, agent: BrowserAgent):
        if agent is None:
            raise ValueError("A BrowserAgent is required.")
        self.agent = agent

    async def execute(self, task: AutomationTask) -> dict[str, Any]:
        """Execute a pending task and record its outcome."""
        if not isinstance(task, AutomationTask):
            raise TypeError("task must be an AutomationTask.")
        if task.status == TaskStatus.RUNNING:
            raise BrowserActionError("Task is already running.")
        if task.status in (TaskStatus.COMPLETED, TaskStatus.FAILED):
            raise BrowserActionError(
                f"Task cannot run from status '{task.status.value}'."
            )

        task.status = TaskStatus.RUNNING
        task.error = None
        task.results = []

        try:
            task.results = await self.agent.execute_many(task.actions)
            task.status = TaskStatus.COMPLETED
        except Exception as exc:
            task.status = TaskStatus.FAILED
            task.error = str(exc)
            raise

        return {
            "task_id": task.task_id,
            "description": task.description,
            "status": task.status.value,
            "results": task.results,
        }
