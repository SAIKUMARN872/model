from typing import Any

from playwright.async_api import Browser, BrowserType

from ..exceptions import BrowserActionError


async def launch_chromium(
    headless: bool = True,
    *,
    executable_path: str | None = None,
    args: list[str] | None = None,
) -> Browser:
    """Launch Chromium with Playwright using explicit launch options."""
    from playwright.async_api import async_playwright

    playwright = await async_playwright().start()

    try:
        options: dict[str, Any] = {
            "headless": headless,
        }
        if executable_path:
            options["executable_path"] = executable_path
        if args:
            options["args"] = args

        browser = await playwright.chromium.launch(**options)
        # Keep the Playwright owner attached to the browser for lifecycle cleanup.
        setattr(browser, "_modelnow_playwright", playwright)
        return browser
    except Exception as exc:
        await playwright.stop()
        raise BrowserActionError(
            f"Chromium launch failed: {exc}"
        ) from exc


async def close_chromium(browser: Browser) -> None:
    """Close Chromium and its Playwright driver."""
    if browser is None:
        return

    playwright = getattr(browser, "_modelnow_playwright", None)
    try:
        await browser.close()
    finally:
        if playwright is not None:
            await playwright.stop()
