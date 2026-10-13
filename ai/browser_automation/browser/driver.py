from playwright.async_api import Browser, BrowserContext, Page

from ..exceptions import BrowserActionError


async def create_context(
    browser: Browser,
    *,
    accept_downloads: bool = False,
    ignore_https_errors: bool = False,
) -> BrowserContext:
    """Create an isolated browser context with safe default settings."""
    if browser is None:
        raise ValueError("A Playwright browser is required.")

    try:
        return await browser.new_context(
            accept_downloads=accept_downloads,
            ignore_https_errors=ignore_https_errors,
        )
    except Exception as exc:
        raise BrowserActionError(
            f"Browser context creation failed: {exc}"
        ) from exc


async def create_page(context: BrowserContext) -> Page:
    """Create a new page in an existing browser context."""
    if context is None:
        raise ValueError("A browser context is required.")

    try:
        return await context.new_page()
    except Exception as exc:
        raise BrowserActionError(
            f"Browser page creation failed: {exc}"
        ) from exc
