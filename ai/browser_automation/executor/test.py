import unittest

from ai.browser_automation import (
    BrowserAction,
    BrowserActionType,
    BrowserAutomationEngine,
    BrowserTask,
    BrowserTaskStatus,
)
from ai.browser_automation.executor import BrowserTaskExecutor
from ai.browser_automation.security.permissions import BrowserPermissionError


class FakePage:
    def __init__(self):
        self.events = []
        self.url = "https://example.com"

    async def goto(self, url, **kwargs):
        self.url = url
        self.events.append(("goto", url))

    async def title(self):
        return "Example"

    def locator(self, selector):
        page = self

        class Locator:
            async def click(self, **kwargs):
                page.events.append(("click", selector))

            async def fill(self, value, **kwargs):
                page.events.append(("fill", selector, value))

        return Locator()


class ExecutorTests(unittest.IsolatedAsyncioTestCase):
    async def test_executor_requires_permission_before_engine_call(self):
        page = FakePage()
        executor = BrowserTaskExecutor(BrowserAutomationEngine(page=page))
        task = BrowserTask(goal="Open site")

        with self.assertRaises(BrowserPermissionError):
            await executor.execute(
                task,
                user_id="user-1",
                permissions=set(),
            )

        self.assertEqual(page.events, [])

    async def test_executor_runs_valid_task(self):
        page = FakePage()
        executor = BrowserTaskExecutor(BrowserAutomationEngine(page=page))
        task = BrowserTask(
            goal="Navigate",
            actions=[
                BrowserAction(
                    BrowserActionType.NAVIGATE,
                    url="https://example.com",
                )
            ],
        )

        result = await executor.execute(
            task,
            user_id="user-1",
            permissions={"browser:execute"},
        )

        self.assertEqual(result.status, BrowserTaskStatus.COMPLETED)


if __name__ == "__main__":
    unittest.main(verbosity=2)
