"""
Chromium browser implementation.
"""

from __future__ import annotations

from typing import Any


class ChromiumBrowser:
    """
    Chromium browser manager using Playwright.
    """

    def __init__(
        self,
        headless: bool = True,
        executable_path: str | None = None,
        args: list[str] | None = None,
    ) -> None:

        self.headless = headless
        self.executable_path = (
            executable_path
        )
        self.args = args or []

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
                "Playwright is required. "
                "Install with: "
                "pip install playwright && "
                "playwright install chromium"
            ) from exc

        self.playwright = (
            await async_playwright().start()
        )

        launch_options = {
            "headless": self.headless,
            "args": self.args,
        }

        if self.executable_path:

            launch_options[
                "executable_path"
            ] = self.executable_path

        launch_options.update(
            kwargs
        )

        self.browser = (
            await self.playwright.chromium.launch(
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
                "Chromium browser is not running."
            )

        self.page = (
            await self.context.new_page()
        )

        return self.page

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