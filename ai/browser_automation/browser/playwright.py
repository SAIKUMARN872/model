"""
Playwright browser driver.
"""

from __future__ import annotations

from typing import Any

from .driver import (
    BrowserDriver,
)


class PlaywrightDriver(
    BrowserDriver
):
    """
    Playwright implementation of BrowserDriver.
    """

    def __init__(
        self,
        browser_type: str = "chromium",
        headless: bool = True,
    ) -> None:

        self.browser_type = (
            browser_type
        )

        self.headless = headless

        self.playwright = None
        self.browser = None
        self.context = None
        self.page = None

    async def launch(
        self,
        **kwargs: Any,
    ) -> Any:

        try:

            from playwright.async_api import (
                async_playwright,
            )

        except ImportError as exc:

            raise RuntimeError(
                "Install Playwright using: "
                "pip install playwright"
            ) from exc

        self.playwright = (
            await async_playwright().start()
        )

        if self.browser_type == "chromium":

            launcher = (
                self.playwright.chromium
            )

        elif self.browser_type == "firefox":

            launcher = (
                self.playwright.firefox
            )

        elif self.browser_type == "webkit":

            launcher = (
                self.playwright.webkit
            )

        else:

            raise ValueError(
                "Unsupported browser type: "
                f"{self.browser_type}"
            )

        launch_options = {
            "headless": self.headless
        }

        launch_options.update(
            kwargs
        )

        self.browser = (
            await launcher.launch(
                **launch_options
            )
        )

        self.context = (
            await self.browser.new_context()
        )

        self.page = (
            await self.context.new_page()
        )

        return self.page

    async def new_page(self) -> Any:

        if self.context is None:

            raise RuntimeError(
                "Browser context is not available."
            )

        self.page = (
            await self.context.new_page()
        )

        return self.page

    async def goto(
        self,
        url: str,
        **kwargs: Any,
    ) -> Any:

        if self.page is None:

            raise RuntimeError(
                "No active browser page."
            )

        return await self.page.goto(
            url,
            **kwargs,
        )

    async def close(self) -> None:

        if self.context:

            await self.context.close()

        if self.browser:

            await self.browser.close()

        if self.playwright:

            await self.playwright.stop()

        self.page = None
        self.context = None
        self.browser = None
        self.playwright = None

    @property
    def is_running(self) -> bool:

        return (
            self.browser is not None
        )