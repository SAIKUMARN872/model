import unittest
from unittest.mock import AsyncMock, MagicMock, patch

from ai.browser_automation.browser.browser import BrowserSession
from ai.browser_automation.browser.driver import create_context, create_page


class BrowserSessionTests(unittest.IsolatedAsyncioTestCase):
    async def test_session_exposes_page_metadata(self):
        page = MagicMock()
        page.url = "https://example.com"
        page.title = AsyncMock(return_value="Example")
        session = BrowserSession(page)

        self.assertEqual(session.url, "https://example.com")
        self.assertEqual(await session.title(), "Example")
        self.assertIs(session.context, page.context)

    async def test_screenshot(self):
        page = MagicMock()
        page.screenshot = AsyncMock()
        session = BrowserSession(page)

        result = await session.screenshot("page.png")

        self.assertEqual(result, "page.png")
        page.screenshot.assert_awaited_once_with(path="page.png")

    async def test_screenshot_rejects_empty_path(self):
        session = BrowserSession(MagicMock())

        with self.assertRaises(ValueError):
            await session.screenshot(" ")

    async def test_close_page_only_when_open(self):
        page = MagicMock()
        page.is_closed.return_value = False
        page.close = AsyncMock()

        await BrowserSession(page).close_page()

        page.close.assert_awaited_once()

    async def test_create_context(self):
        browser = MagicMock()
        browser.new_context = AsyncMock(return_value="context")

        result = await create_context(browser)

        self.assertEqual(result, "context")
        browser.new_context.assert_awaited_once_with(
            accept_downloads=False,
            ignore_https_errors=False,
        )

    async def test_create_page(self):
        context = MagicMock()
        context.new_page = AsyncMock(return_value="page")

        result = await create_page(context)

        self.assertEqual(result, "page")


if __name__ == "__main__":
    unittest.main()
