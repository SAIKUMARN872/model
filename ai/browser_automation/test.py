import unittest

from ai.browser_automation import (
    BrowserAction,
    BrowserActionType,
    BrowserAutomationEngine,
    BrowserTask,
    BrowserTaskStatus,
    UnsafeUrlError,
    validate_url,
)


class FakeLocator:
    def __init__(self, page, selector):
        self.page = page
        self.selector = selector

    async def click(self, **kwargs):
        self.page.events.append(("click", self.selector))

    async def fill(self, value, **kwargs):
        self.page.events.append(("fill", self.selector, value))


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
        return FakeLocator(self, selector)


class BrowserAutomationTests(unittest.IsolatedAsyncioTestCase):
    def test_localhost_is_rejected_for_security(self):
        with self.assertRaises(UnsafeUrlError):
            validate_url("http://localhost:8000")

    def test_private_ip_is_rejected_for_security(self):
        with self.assertRaises(UnsafeUrlError):
            validate_url("http://192.168.1.10")

    def test_local_file_url_is_rejected_for_security(self):
        with self.assertRaises(UnsafeUrlError):
            validate_url("file:///C:/Windows/win.ini")

    def test_public_url_is_accepted(self):
        self.assertEqual(
            validate_url("https://example.com"),
            "https://example.com",
        )

    async def test_navigation_and_fill_succeed(self):
        page = FakePage()
        engine = BrowserAutomationEngine(page=page)
        task = BrowserTask(
            goal="Open page and fill search",
            actions=[
                BrowserAction(
                    BrowserActionType.NAVIGATE,
                    url="https://example.com",
                ),
                BrowserAction(
                    BrowserActionType.FILL,
                    selector="input[name=q]",
                    value="ModelNow",
                ),
            ],
        )

        result = await engine.execute(task)

        self.assertEqual(result.status, BrowserTaskStatus.COMPLETED)
        self.assertEqual(result.completed_actions, 2)
        self.assertIn(("fill", "input[name=q]", "ModelNow"), page.events)

    async def test_requested_verification_passes(self):
        page = FakePage()
        engine = BrowserAutomationEngine(page=page)
        task = BrowserTask(
            goal="Open example and verify its title",
            metadata={
                "verification_expectation": {
                    "title_contains": "Example",
                }
            },
        )

        result = await engine.execute(task)

        self.assertEqual(result.status, BrowserTaskStatus.COMPLETED)
        self.assertEqual(result.verification["status"], "passed")
        self.assertIsNone(result.error)
        self.assertEqual(result.to_dict()["verification"]["status"], "passed")

    async def test_failed_verification_prevents_completed_status(self):
        page = FakePage()
        engine = BrowserAutomationEngine(page=page)
        task = BrowserTask(
            goal="Verify an unexpected title",
            metadata={
                "verification_expectation": {
                    "title_contains": "Checkout Complete",
                }
            },
        )

        result = await engine.execute(task)

        self.assertEqual(result.status, BrowserTaskStatus.FAILED)
        self.assertEqual(result.verification["status"], "failed")
        self.assertIn("verification", result.error.lower())

    async def test_purchase_waits_for_approval(self):
        page = FakePage()
        engine = BrowserAutomationEngine(page=page)
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

        result = await engine.execute(task)

        self.assertEqual(result.status, BrowserTaskStatus.AWAITING_APPROVAL)
        self.assertEqual(page.events, [])

    async def test_purchase_executes_after_approval(self):
        page = FakePage()
        engine = BrowserAutomationEngine(
            page=page,
            approval_callback=lambda task_id, description: True,
        )
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

        result = await engine.execute(task)

        self.assertEqual(result.status, BrowserTaskStatus.COMPLETED)
        self.assertIn(("click", "#buy-now"), page.events)


if __name__ == "__main__":
    unittest.main(verbosity=2)
