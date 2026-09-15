"""
Click-related browser actions.
"""

from __future__ import annotations

from typing import Any

from .utils import (
    retry_async,
    validate_selector,
)


class ClickActions:
    """Reusable click operations."""

    def __init__(
        self,
        page: Any,
        default_timeout: int = 30000,
    ) -> None:

        self.page = page
        self.default_timeout = (
            default_timeout
        )

    async def click(
        self,
        selector: str,
        timeout: int | None = None,
        force: bool = False,
    ) -> None:
        """Click an element."""

        selector = validate_selector(
            selector
        )

        locator = self.page.locator(
            selector
        )

        await locator.wait_for(
            state="visible",
            timeout=(
                timeout
                or self.default_timeout
            ),
        )

        await locator.click(
            timeout=(
                timeout
                or self.default_timeout
            ),
            force=force,
        )

    async def double_click(
        self,
        selector: str,
        timeout: int | None = None,
    ) -> None:
        """Double click an element."""

        selector = validate_selector(
            selector
        )

        locator = self.page.locator(
            selector
        )

        await locator.wait_for(
            state="visible",
            timeout=(
                timeout
                or self.default_timeout
            ),
        )

        await locator.dblclick(
            timeout=(
                timeout
                or self.default_timeout
            )
        )

    async def click_text(
        self,
        text: str,
        exact: bool = False,
    ) -> None:
        """Click visible text."""

        locator = self.page.get_by_text(
            text,
            exact=exact,
        )

        await locator.first.wait_for(
            state="visible",
            timeout=self.default_timeout,
        )

        await locator.first.click()

    async def click_role(
        self,
        role: str,
        name: str | None = None,
        exact: bool = False,
    ) -> None:
        """Click an ARIA role."""

        if name:

            locator = self.page.get_by_role(
                role,
                name=name,
                exact=exact,
            )

        else:

            locator = self.page.get_by_role(
                role
            )

        await locator.first.wait_for(
            state="visible",
            timeout=self.default_timeout,
        )

        await locator.first.click()

    async def click_with_retry(
        self,
        selector: str,
        retries: int = 3,
    ) -> None:
        """Click with automatic retries."""

        selector = validate_selector(
            selector
        )

        async def operation():
            await self.click(
                selector
            )

        await retry_async(
            operation,
            retries=retries,
        )

    async def is_clickable(
        self,
        selector: str,
    ) -> bool:
        """Check whether an element is visible and enabled."""

        selector = validate_selector(
            selector
        )

        locator = self.page.locator(
            selector
        )

        try:

            return (
                await locator.first.is_visible()
                and await locator.first.is_enabled()
            )

        except Exception:
            return False