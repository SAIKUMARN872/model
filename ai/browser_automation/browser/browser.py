"""
Generic browser abstraction.
"""

from __future__ import annotations

from typing import Any


class BrowserError(Exception):
    """Base browser exception."""


class Browser:
    """
    Generic browser wrapper.

    The actual browser implementation is delegated
    to Chromium, Playwright, or another driver.
    """

    def __init__(
        self,
        driver: Any | None = None,
    ) -> None:

        self.driver = driver
        self.context = None
        self.page = None

    async def launch(
        self,
        **kwargs: Any,
    ) -> Any:

        if self.driver is None:

            raise BrowserError(
                "Browser driver is not configured."
            )

        result = await self.driver.launch(
            **kwargs
        )

        self.context = getattr(
            self.driver,
            "context",
            None,
        )

        self.page = getattr(
            self.driver,
            "page",
            None,
        )

        return result

    async def new_page(self) -> Any:

        if self.context is None:

            raise BrowserError(
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

            raise BrowserError(
                "No active page."
            )

        return await self.page.goto(
            url,
            **kwargs,
        )

    async def close(self) -> None:

        if self.context is not None:

            await self.context.close()

        if self.driver is not None:

            close = getattr(
                self.driver,
                "close",
                None,
            )

            if close is not None:

                await close()

        self.context = None
        self.page = None

    @property
    def is_running(self) -> bool:

        return (
            self.page is not None
        )