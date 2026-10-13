from collections.abc import Iterable

from ..models import BrowserExecutionResult, BrowserTask
from .executor import BrowserTaskExecutor


async def run_browser_task(
    executor: BrowserTaskExecutor,
    task: BrowserTask,
    *,
    user_id: str | None,
    permissions: Iterable[str] | None,
) -> BrowserExecutionResult:
    """Run a task through the authorized executor."""
    return await executor.execute(
        task,
        user_id=user_id,
        permissions=permissions,
    )
