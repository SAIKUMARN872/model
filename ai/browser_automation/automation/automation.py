from typing import Any, Iterable

from ..agents import BrowserAgent
from ..models import BrowserAction
from .tasks import AutomationTask, TaskStatus
from .workflow import AutomationWorkflow


class BrowserAutomation:
    """Coordinate browser automation tasks and their execution workflow."""

    def __init__(self, page: Any):
        if page is None:
            raise ValueError("A Playwright page is required.")
        self.agent = BrowserAgent(page)
        self.workflow = AutomationWorkflow(self.agent)

    async def run(self, task: AutomationTask) -> dict[str, Any]:
        """Run a task through the automation workflow."""
        return await self.workflow.execute(task)

    async def execute_actions(
        self,
        actions: Iterable[BrowserAction],
    ) -> list[dict[str, Any]]:
        """Execute an ordered sequence of browser actions."""
        return await self.agent.execute_many(actions)
