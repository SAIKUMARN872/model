from typing import Any

from playwright.async_api import Page, BrowserContext

from ..exceptions import BrowserActionError


class BrowserSession:
    """Manage an existing Playwright page and its browser context."""

    def __init__(self, page: Page):
        if page is None:
            raise ValueError("A Playwright page is required.")
        self.page = page

    @property
    def context(self) -> BrowserContext:
        return self.page.context

    @property
    def url(self) -> str:
        return self.page.url

    async def title(self) -> str:
        return await self.page.title()

    async def close_page(self) -> None:
        if not self.page.is_closed():
            await self.page.close()

    async def screenshot(self, path: str) -> str:
        if not isinstance(path, str) or not path.strip():
            raise ValueError("Screenshot path must be a non-empty string.")

        try:
            await self.page.screenshot(path=path)
            return path
        except Exception as exc:
            raise BrowserActionError(
                f"Browser screenshot failed: {exc}"
            ) from exc


Browser = BrowserSession
