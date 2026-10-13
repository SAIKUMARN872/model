import unittest
from unittest.mock import AsyncMock, MagicMock

from ai.browser_automation.agents import (
    BrowserAgent,
    ResearchAgent,
    WebAgent,
    normalize_text,
)
from ai.browser_automation.constants import BrowserActionType
from ai.browser_automation.models import BrowserAction


class AgentUtilityTests(unittest.TestCase):
    def test_normalize_text(self):
        self.assertEqual(
            normalize_text("  ModelNow \n  Browser   Agent "),
            "ModelNow Browser Agent",
        )

    def test_normalize_non_string(self):
        self.assertEqual(normalize_text(None), "")


class BrowserAgentTests(unittest.IsolatedAsyncioTestCase):
    async def test_execute_many_runs_in_order(self):
        page = MagicMock()
        agent = BrowserAgent(page)
        first = BrowserAction(action_type=BrowserActionType.INSPECT)
        second = BrowserAction(action_type=BrowserActionType.INSPECT)

        agent.execute = AsyncMock(
            side_effect=[
                {"action": "inspect", "title": "First"},
                {"action": "inspect", "title": "Second"},
            ]
        )

        results = await agent.execute_many([first, second])

        self.assertEqual(len(results), 2)
        self.assertEqual(results[0]["title"], "First")
        self.assertEqual(results[1]["title"], "Second")
        self.assertEqual(agent.execute.await_count, 2)

    async def test_execute_many_stops_on_failure(self):
        from ai.browser_automation.exceptions import BrowserActionError

        agent = BrowserAgent(MagicMock())
        agent.execute = AsyncMock(side_effect=RuntimeError("failed"))

        with self.assertRaises(BrowserActionError):
            await agent.execute_many([
                BrowserAction(action_type=BrowserActionType.INSPECT),
                BrowserAction(action_type=BrowserActionType.INSPECT),
            ])

        agent.execute.assert_awaited_once()

    async def test_requires_page(self):
        with self.assertRaises(ValueError):
            BrowserAgent(None)


class ResearchAgentTests(unittest.IsolatedAsyncioTestCase):
    async def test_inspect_current_page(self):
        page = MagicMock()
        page.title = AsyncMock(return_value="Example")
        page.url = "https://example.com"
        page.locator.return_value.inner_text = AsyncMock(
            return_value="Example page content"
        )

        result = await ResearchAgent(page).inspect_current_page()

        self.assertEqual(result["title"], "Example")
        self.assertEqual(result["url"], "https://example.com")
        self.assertEqual(result["content"], "Example page content")
        self.assertEqual(
            result["normalized_content"],
            "Example page content",
        )


class WebAgentTests(unittest.IsolatedAsyncioTestCase):
    async def test_inspect_current_page(self):
        page = MagicMock()
        page.title = AsyncMock(return_value="Example")
        page.url = "https://example.com"
        page.locator.return_value.inner_text = AsyncMock(
            return_value="Example page"
        )
        page.locator.return_value.count = AsyncMock(return_value=0)

        result = await WebAgent(page).inspect()

        self.assertEqual(result["title"], "Example")
        self.assertEqual(result["url"], "https://example.com")
        self.assertEqual(result["content"], "Example page")
        self.assertEqual(result["links"], [])

    async def test_requires_page(self):
        with self.assertRaises(ValueError):
            WebAgent(None)


if __name__ == "__main__":
    unittest.main()
