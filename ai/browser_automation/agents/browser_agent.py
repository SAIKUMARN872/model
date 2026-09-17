"""
Core browser automation agent.
"""

from __future__ import annotations

from typing import Any

from ..actions import (
    BrowserActions,
)
from .utils import (
    build_result,
    clean_text,
    safe_close,
)


class BrowserAgent:
    """
    General-purpose browser automation agent.

    Responsible for browser/page lifecycle and
    common navigation and interaction operations.
    """

    def __init__(
        self,
        browser: Any | None = None,
        page: Any | None = None,
        headless: bool = True,
        timeout: int = 30000,
    ) -> None:

        self.browser = browser
        self.page = page
        self.headless = headless
        self.timeout = timeout

        self.playwright: Any = None
        self.context: Any = None
        self.actions: BrowserActions | None = (
            BrowserActions(
                page,
                timeout,
            )
            if page is not None
            else None
        )

    async def start(
        self,
        browser_type: str = "chromium",
    ) -> "BrowserAgent":
        """
        Start Playwright and create a browser page.
        """

        if self.page is not None:
            self.actions = BrowserActions(
                self.page,
                self.timeout,
            )
            return self

        try:

            from playwright.async_api import (
                async_playwright,
            )

        except ImportError as exc:

            raise RuntimeError(
                "Playwright is required. "
                "Install with: "
                "pip install playwright && "
                "playwright install"
            ) from exc

        self.playwright = (
            await async_playwright().start()
        )

        if browser_type == "chromium":

            browser_launcher = (
                self.playwright.chromium
            )

        elif browser_type == "firefox":

            browser_launcher = (
                self.playwright.firefox
            )

        elif browser_type == "webkit":

            browser_launcher = (
                self.playwright.webkit
            )

        else:

            raise ValueError(
                "browser_type must be "
                "chromium, firefox, or webkit"
            )

        self.browser = (
            await browser_launcher.launch(
                headless=self.headless
            )
        )

        self.context = (
            await self.browser.new_context()
        )

        self.page = (
            await self.context.new_page()
        )

        self.page.set_default_timeout(
            self.timeout
        )

        self.actions = BrowserActions(
            self.page,
            self.timeout,
        )

        return self

    def _require_actions(
        self,
    ) -> BrowserActions:

        if self.actions is None:

            raise RuntimeError(
                "BrowserAgent is not started. "
                "Call await agent.start() first."
            )

        return self.actions

    async def navigate(
        self,
        url: str,
    ) -> dict[str, Any]:

        try:

            actions = self._require_actions()

            await actions.goto(
                url
            )

            return build_result(
                success=True,
                data={
                    "url": await actions.get_url(),
                    "title": await actions.get_title(),
                },
            )

        except Exception as exc:

            return build_result(
                success=False,
                error=str(exc),
            )

    async def click(
        self,
        selector: str,
    ) -> dict[str, Any]:

        try:

            actions = self._require_actions()

            await actions.click(
                selector
            )

            return build_result(
                success=True,
                data={
                    "selector": selector
                },
            )

        except Exception as exc:

            return build_result(
                success=False,
                error=str(exc),
            )

    async def fill(
        self,
        selector: str,
        value: str,
    ) -> dict[str, Any]:

        try:

            actions = self._require_actions()

            await actions.fill(
                selector,
                value,
            )

            return build_result(
                success=True,
                data={
                    "selector": selector
                },
            )

        except Exception as exc:

            return build_result(
                success=False,
                error=str(exc),
            )

    async def extract_page(
        self,
    ) -> dict[str, Any]:

        try:

            if self.page is None:

                raise RuntimeError(
                    "Page is not available."
                )

            title = await self.page.title()

            url = self.page.url

            text = await self.page.locator(
                "body"
            ).inner_text()

            return build_result(
                success=True,
                data={
                    "title": title,
                    "url": url,
                    "text": clean_text(
                        text
                    ),
                },
            )

        except Exception as exc:

            return build_result(
                success=False,
                error=str(exc),
            )

    async def screenshot(
        self,
        path: str,
    ) -> dict[str, Any]:

        try:

            actions = self._require_actions()

            await actions.screenshot(
                path
            )

            return build_result(
                success=True,
                data={
                    "path": path
                },
            )

        except Exception as exc:

            return build_result(
                success=False,
                error=str(exc),
            )

    async def stop(self) -> None:
        """Close browser resources."""

        await safe_close(
            self.context
        )

        await safe_close(
            self.browser
        )

        await safe_close(
            self.playwright
        )

        self.context = None
        self.browser = None
        self.page = None
        self.actions = None
        self.playwright = None

    async def __aenter__(
        self,
    ) -> "BrowserAgent":

        await self.start()

        return self

    async def __aexit__(
        self,
        exc_type,
        exc_value,
        traceback,
    ) -> None:

        await self.stop()