import asyncio
import tempfile
import unittest
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock

from ai.browser_automation.actions import (
    action_result,
    click_element,
    fill_field,
    perform_action,
    require_selector,
)
from ai.browser_automation.constants import BrowserActionType
from ai.browser_automation.exceptions import BrowserActionError
from ai.browser_automation.models import BrowserAction


class BrowserActionsTests(unittest.IsolatedAsyncioTestCase):
    async def test_click_element(self):
        page = MagicMock()
        page.locator.return_value.click = AsyncMock()

        result = await click_element(page, "#submit")

        page.locator.assert_called_once_with("#submit")
        page.locator.return_value.click.assert_awaited_once()
        self.assertEqual(result["action"], "click")
        self.assertEqual(result["selector"], "#submit")

    async def test_click_failure_is_wrapped(self):
        page = MagicMock()
        page.locator.return_value.click = AsyncMock(
            side_effect=RuntimeError("click failed")
        )

        with self.assertRaises(BrowserActionError):
            await click_element(page, "#submit")

    async def test_click_rejects_empty_selector(self):
        page = MagicMock()

        with self.assertRaises(ValueError):
            await click_element(page, " ")

    async def test_fill_field(self):
        page = MagicMock()
        page.locator.return_value.fill = AsyncMock()

        result = await fill_field(page, "#email", "test@example.com")

        page.locator.assert_called_once_with("#email")
        page.locator.return_value.fill.assert_awaited_once_with(
            "test@example.com",
            timeout=15000,
        )
        self.assertEqual(result["action"], "fill")
        self.assertTrue(result["filled"])
        self.assertNotIn("test@example.com", str(result))

    async def test_fill_rejects_non_string_value(self):
        page = MagicMock()

        with self.assertRaises(ValueError):
            await fill_field(page, "#email", None)

    async def test_dispatch_rejects_wrong_action_type(self):
        page = MagicMock()

        with self.assertRaises(TypeError):
            await perform_action(page, "click")

    async def test_dispatch_inspect(self):
        page = MagicMock()
        page.title = AsyncMock(return_value="Example")
        page.url = "https://example.com"

        action = BrowserAction(action_type=BrowserActionType.INSPECT)
        result = await perform_action(page, action)

        self.assertEqual(result["action"], "inspect")
        self.assertEqual(result["title"], "Example")
        self.assertEqual(result["url"], "https://example.com")

    async def test_dispatch_screenshot(self):
        page = MagicMock()
        page.screenshot = AsyncMock()

        with tempfile.TemporaryDirectory() as temp_dir:
            target = Path(temp_dir) / "page.png"
            action = BrowserAction(
                action_type=BrowserActionType.SCREENSHOT,
                value=str(target),
            )

            result = await perform_action(page, action)

            page.screenshot.assert_awaited_once_with(path=str(target.resolve()))
            self.assertEqual(result["action"], "screenshot")
            self.assertEqual(result["screenshot_path"], str(target.resolve()))

    async def test_dispatch_navigation(self):
        page = MagicMock()
        page.goto = AsyncMock()

        action = BrowserAction(
            action_type=BrowserActionType.NAVIGATE,
            url="https://example.com",
        )
        result = await perform_action(page, action)

        page.goto.assert_awaited_once()
        self.assertEqual(result["action"], "navigate")

    async def test_require_selector(self):
        self.assertEqual(require_selector("  #login ", "Click"), "#login")

    async def test_require_selector_rejects_empty(self):
        with self.assertRaises(ValueError):
            require_selector("", "Click")

    def test_action_result(self):
        self.assertEqual(
            action_result("click", selector="#submit"),
            {"action": "click", "selector": "#submit"},
        )


if __name__ == "__main__":
    unittest.main()

