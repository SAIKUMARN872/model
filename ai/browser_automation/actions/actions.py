"""
High-level browser action facade.
"""

from __future__ import annotations

from typing import Any

from .click import ClickActions
from .forms import FormActions
from .utils import (
    validate_url,
)


class BrowserActions:
    """
    Unified interface for browser interactions.

    Example:

        actions = BrowserActions(page)

        await actions.goto(
            "https://example.com"
        )

        await actions.click(
            "#login"
        )

        await actions.fill(
            "#email",
            "user@example.com"
        )
    """

    def __init__(
        self,
        page: Any,
        default_timeout: int = 30000,
    ) -> None:

        self.page = page

        self.clicks = ClickActions(
            page,
            default_timeout,
        )

        self.forms = FormActions(
            page,
            default_timeout,
        )

        self.default_timeout = (
            default_timeout
        )

    async def goto(
        self,
        url: str,
        wait_until: str = "domcontentloaded",
    ) -> None:
        """Navigate to a URL."""

        url = validate_url(
            url
        )

        await self.page.goto(
            url,
            wait_until=wait_until,
            timeout=self.default_timeout,
        )

    async def reload(self) -> None:
        """Reload current page."""

        await self.page.reload(
            wait_until="domcontentloaded",
            timeout=self.default_timeout,
        )

    async def back(self) -> None:
        """Navigate backward."""

        await self.page.go_back(
            wait_until="domcontentloaded",
            timeout=self.default_timeout,
        )

    async def forward(self) -> None:
        """Navigate forward."""

        await self.page.go_forward(
            wait_until="domcontentloaded",
            timeout=self.default_timeout,
        )

    async def click(
        self,
        selector: str,
    ) -> None:

        await self.clicks.click(
            selector
        )

    async def click_text(
        self,
        text: str,
        exact: bool = False,
    ) -> None:

        await self.clicks.click_text(
            text,
            exact,
        )

    async def fill(
        self,
        selector: str,
        value: str,
    ) -> None:

        await self.forms.fill(
            selector,
            value,
        )

    async def select(
        self,
        selector: str,
        value: str | None = None,
        label: str | None = None,
    ) -> None:

        await self.forms.select_option(
            selector,
            value,
            label,
        )

    async def check(
        self,
        selector: str,
    ) -> None:

        await self.forms.check(
            selector
        )

    async def upload(
        self,
        selector: str,
        file_path: str,
    ) -> None:

        await self.forms.upload_file(
            selector,
            file_path,
        )

    async def screenshot(
        self,
        path: str,
        full_page: bool = True,
    ) -> None:
        """Take a screenshot."""

        await self.page.screenshot(
            path=path,
            full_page=full_page,
        )

    async def get_title(self) -> str:
        """Get page title."""

        return await self.page.title()

    async def get_url(self) -> str:
        """Get current URL."""

        return self.page.url

    async def get_text(
        self,
        selector: str,
    ) -> str:

        locator = self.page.locator(
            selector
        )

        return (
            await locator.inner_text()
        )

    async def exists(
        self,
        selector: str,
    ) -> bool:

        try:

            return (
                await self.page.locator(
                    selector
                ).count()
                > 0
            )

        except Exception:

            return False

    async def wait(
        self,
        milliseconds: int = 1000,
    ) -> None:

        await self.page.wait_for_timeout(
            milliseconds
        )