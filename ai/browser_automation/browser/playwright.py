from playwright.async_api import async_playwright


async def playwright_context():
    """Return an async context manager for Playwright's lifecycle."""
    return async_playwright()
