import unittest

from ai.browser_automation import (
    BrowserAction,
    BrowserActionType,
    BrowserAutomationEngine,
    BrowserTask,
    BrowserTaskStatus,
)
from ai.browser_automation.executor import BrowserTaskExecutor
from ai.browser_automation.security.permissions import (
    BrowserPermissionError,
    require_browser_permission,
)
from ai.browser_automation.security.sandbox import (
    SandboxPolicy,
    validate_sandbox_destination,
)
from ai.browser_automation.security.validator import validate_browser_task
from ai.browser_automation.exceptions import UnsafeUrlError


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


class BrowserSecurityTests(unittest.TestCase):
    def test_permission_requires_user_identity(self):
        with self.assertRaises(BrowserPermissionError):
            require_browser_permission(None, {"browser:execute"})

    def test_permission_requires_exact_grant(self):
        with self.assertRaises(BrowserPermissionError):
            require_browser_permission("user-1", {"browser:read"})

    def test_valid_permission_is_accepted(self):
        require_browser_permission("user-1", {"browser:execute"})

    def test_sandbox_rejects_localhost(self):
        with self.assertRaises(UnsafeUrlError):
            validate_sandbox_destination("http://localhost:8000")

    def test_sandbox_can_disable_http(self):
        policy = SandboxPolicy(allow_http=False)
        with self.assertRaises(ValueError):
            policy.validate_destination("http://example.com")

    def test_task_validator_returns_valid_task(self):
        task = BrowserTask(
            goal="Open a public website",
            start_url="https://example.com",
        )
        self.assertIs(validate_browser_task(task), task)


class BrowserExecutorTests(unittest.IsolatedAsyncioTestCase):
    async def test_missing_permission_prevents_execution(self):
        page = FakePage()
        executor = BrowserTaskExecutor(BrowserAutomationEngine(page=page))
        task = BrowserTask(
            goal="Open a public website",
            actions=[
                BrowserAction(
                    BrowserActionType.NAVIGATE,
                    url="https://example.com",
                )
            ],
        )

        with self.assertRaises(BrowserPermissionError):
            await executor.execute(
                task,
                user_id="user-1",
                permissions={"browser:read"},
            )

        self.assertEqual(page.events, [])

    async def test_authorized_task_executes(self):
        page = FakePage()
        executor = BrowserTaskExecutor(BrowserAutomationEngine(page=page))
        task = BrowserTask(
            goal="Open a public website",
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
        self.assertIn(("goto", "https://example.com"), page.events)

    async def test_sensitive_action_still_requires_approval(self):
        page = FakePage()
        executor = BrowserTaskExecutor(BrowserAutomationEngine(page=page))
        task = BrowserTask(
            goal="Purchase item",
            actions=[
                BrowserAction(
                    BrowserActionType.CLICK,
                    selector="#buy-now",
                    description="Click buy now",
                )
            ],
        )

        result = await executor.execute(
            task,
            user_id="user-1",
            permissions={"browser:execute"},
        )

        self.assertEqual(result.status, BrowserTaskStatus.AWAITING_APPROVAL)
        self.assertEqual(page.events, [])


if __name__ == "__main__":
    unittest.main(verbosity=2)
