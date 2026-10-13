import unittest

from ai.browser_automation import (
    BrowserAction,
    BrowserActionType,
    BrowserAutomationEngine,
    BrowserTask,
    BrowserTaskStatus,
)


class RedirectPage:
    def __init__(self):
        self.events = []
        self.url = "https://example.com"

    async def goto(self, url, **kwargs):
        self.events.append(("goto", url))
        self.url = "http://127.0.0.1"

    async def title(self):
        return "Redirected"

    def locator(self, selector):
        raise AssertionError("No action should run after unsafe navigation.")


class NavigationGuardTests(unittest.IsolatedAsyncioTestCase):
    async def test_blocked_final_destination_fails_task(self):
        page = RedirectPage()
        engine = BrowserAutomationEngine(page=page)
        task = BrowserTask(
            goal="Visit public site",
            actions=[
                BrowserAction(
                    BrowserActionType.NAVIGATE,
                    url="https://example.com",
                )
            ],
        )

        result = await engine.execute(task)

        self.assertEqual(result.status, BrowserTaskStatus.FAILED)
        self.assertIn("private", (result.error or "").lower()
                      + " private destination blocked")

    async def test_sensitive_action_still_waits_for_approval(self):
        page = RedirectPage()
        page.url = "https://example.com"
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


if __name__ == "__main__":
    unittest.main(verbosity=2)
