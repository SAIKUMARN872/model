from collections.abc import Iterable

from ..engine import BrowserAutomationEngine
from ..models import BrowserExecutionResult, BrowserTask
from ..security.permissions import require_browser_permission
from ..security.validator import validate_browser_task


class BrowserTaskExecutor:
    """Authorized entry point for browser task execution."""

    def __init__(self, engine: BrowserAutomationEngine):
        self.engine = engine

    async def execute(
        self,
        task: BrowserTask,
        *,
        user_id: str | None,
        permissions: Iterable[str] | None,
    ) -> BrowserExecutionResult:
        require_browser_permission(user_id, permissions)
        validate_browser_task(task)
        return await self.engine.execute(task)
