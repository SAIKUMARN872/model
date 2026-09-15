"""
Main browser automation controller.
"""

from __future__ import annotations

from typing import Any

from .tasks import (
    AutomationTask,
    TaskExecutor,
    TaskQueue,
)
from .utils import (
    build_result,
    validate_url,
)
from .workflow import (
    Workflow,
    WorkflowManager,
)


class AutomationEngine:
    """
    Central automation engine.

    Combines browser actions, tasks and workflows.
    """

    def __init__(
        self,
        browser_agent: Any | None = None,
    ) -> None:

        self.browser_agent = (
            browser_agent
        )

        self.task_executor = (
            TaskExecutor()
        )

        self.task_queue = (
            TaskQueue()
        )

        self.workflow_manager = (
            WorkflowManager()
        )

    def set_agent(
        self,
        browser_agent: Any,
    ) -> None:

        self.browser_agent = (
            browser_agent
        )

    async def navigate(
        self,
        url: str,
    ) -> dict[str, Any]:

        url = validate_url(
            url
        )

        if self.browser_agent is None:

            raise RuntimeError(
                "Browser agent is not configured."
            )

        return await self.browser_agent.navigate(
            url
        )

    def create_task(
        self,
        name: str,
        action,
        **metadata: Any,
    ) -> AutomationTask:

        task = AutomationTask(
            name=name,
            action=action,
            metadata=metadata,
        )

        self.task_queue.add(
            task
        )

        return task

    async def run_task(
        self,
        task: AutomationTask,
    ) -> AutomationTask:

        return await self.task_executor.execute(
            task
        )

    async def run_pending_tasks(
        self,
        concurrent: bool = False,
    ) -> list[AutomationTask]:

        tasks = self.task_queue.pending()

        return await self.task_executor.execute_many(
            tasks,
            concurrent=concurrent,
        )

    def create_workflow(
        self,
        name: str,
    ) -> Workflow:

        workflow = Workflow(
            name
        )

        self.workflow_manager.register(
            workflow
        )

        return workflow

    def register_workflow(
        self,
        workflow: Workflow,
        overwrite: bool = False,
    ) -> None:

        self.workflow_manager.register(
            workflow,
            overwrite=overwrite,
        )

    async def run_workflow(
        self,
        workflow_id: str,
    ):

        return await self.workflow_manager.run(
            workflow_id
        )

    async def click(
        self,
        selector: str,
    ) -> dict[str, Any]:

        if self.browser_agent is None:

            raise RuntimeError(
                "Browser agent is not configured."
            )

        return await self.browser_agent.click(
            selector
        )

    async def fill(
        self,
        selector: str,
        value: str,
    ) -> dict[str, Any]:

        if self.browser_agent is None:

            raise RuntimeError(
                "Browser agent is not configured."
            )

        return await self.browser_agent.fill(
            selector,
            value,
        )

    async def screenshot(
        self,
        path: str,
    ) -> dict[str, Any]:

        if self.browser_agent is None:

            raise RuntimeError(
                "Browser agent is not configured."
            )

        return await self.browser_agent.screenshot(
            path
        )

    async def close(self) -> None:

        if self.browser_agent is not None:

            stop = getattr(
                self.browser_agent,
                "stop",
                None,
            )

            if stop is not None:

                await stop()

    def status(self) -> dict[str, Any]:

        tasks = self.task_queue.all()

        return build_result(
            success=True,
            data={
                "tasks": len(tasks),
                "pending_tasks": len(
                    self.task_queue.pending()
                ),
                "workflows": len(
                    self.workflow_manager.list()
                ),
                "browser_connected": (
                    self.browser_agent
                    is not None
                ),
            },
        )