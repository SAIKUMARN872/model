from typing import Any

from .browser import BrowserSession
from .chromium import close_chromium, launch_chromium
from .driver import create_context, create_page


class BrowserAutomationRuntime:
    """Own the lifecycle of Chromium, its context, and its page."""

    def __init__(self, headless: bool = True):
        self.headless = headless
        self.browser: Any = None
        self.context: Any = None
        self.page: Any = None
        self.session: BrowserSession | None = None

    async def start(self) -> BrowserSession:
        """Start Chromium and create a fresh isolated page."""
        if self.session is not None:
            raise RuntimeError("Browser runtime is already started.")

        try:
            self.browser = await launch_chromium(headless=self.headless)
            self.context = await create_context(self.browser)
            self.page = await create_page(self.context)
            self.session = BrowserSession(self.page)
            return self.session
        except Exception:
            await self.stop()
            raise

    async def stop(self) -> None:
        """Close browser resources in reverse creation order."""
        browser = self.browser
        context = self.context

        self.session = None
        self.page = None
        self.context = None
        self.browser = None

        if browser is not None:
            await close_chromium(browser)
        elif context is not None:
            await context.close()
