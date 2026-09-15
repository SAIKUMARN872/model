"""
Playwright browser driver for ModelNow.

Provides a complete asynchronous browser implementation
using Playwright.
"""

from __future__ import annotations

from typing import Any

from .driver import (
    BrowserDriver,
    BrowserDriverError,
    BrowserNotStartedError,
)


class PlaywrightDriverError(
    BrowserDriverError
):
    """Playwright-specific driver error."""


class PlaywrightDriver(
    BrowserDriver
):
    """
    Async Playwright browser driver.

    Supported browsers:

        chromium
        firefox
        webkit

    Example:

        driver = PlaywrightDriver(
            browser_type="chromium",
            headless=True,
        )

        await driver.launch()

        await driver.goto(
            "https://example.com"
        )

        print(await driver.page.title())

        await driver.close()
    """

    SUPPORTED_BROWSERS = {
        "chromium",
        "firefox",
        "webkit",
    }

    def __init__(
        self,
        browser_type: str = "chromium",
        headless: bool = True,
        timeout: int = 30000,
        viewport: dict[str, int] | None = None,
        user_agent: str | None = None,
        locale: str = "en-US",
        timezone_id: str | None = None,
        proxy: dict[str, Any] | None = None,
        ignore_https_errors: bool = False,
        args: list[str] | None = None,
        executable_path: str | None = None,
    ) -> None:

        browser_type = (
            browser_type.strip().lower()
        )

        if (
            browser_type
            not in self.SUPPORTED_BROWSERS
        ):

            raise ValueError(
                f"Unsupported browser '{browser_type}'. "
                f"Supported browsers: "
                f"{sorted(self.SUPPORTED_BROWSERS)}"
            )

        if timeout <= 0:

            raise ValueError(
                "timeout must be greater than zero."
            )

        self.browser_type = (
            browser_type
        )

        self.headless = headless

        self.timeout = timeout

        self.viewport = viewport

        self.user_agent = user_agent

        self.locale = locale

        self.timezone_id = timezone_id

        self.proxy = proxy

        self.ignore_https_errors = (
            ignore_https_errors
        )

        self.args = args or []

        self.executable_path = (
            executable_path
        )

        self.playwright: Any = None

        self.browser: Any = None

        self._context: Any = None

        self._page: Any = None

    # ==========================================================
    # Properties
    # ==========================================================

    @property
    def page(self) -> Any:

        return self._page

    @property
    def context(self) -> Any:

        return self._context

    @property
    def is_running(self) -> bool:

        return (
            self.browser is not None
        )

    @property
    def is_page_available(self) -> bool:

        return (
            self._page is not None
        )

    # ==========================================================
    # Playwright initialization
    # ==========================================================

    async def _start_playwright(
        self,
    ) -> Any:

        if self.playwright is not None:

            return self.playwright

        try:

            from playwright.async_api import (
                async_playwright,
            )

        except ImportError as exc:

            raise PlaywrightDriverError(
                "Playwright is not installed. "
                "Install it using:\n"
                "pip install playwright\n"
                "playwright install"
            ) from exc

        try:

            self.playwright = (
                await async_playwright().start()
            )

        except Exception as exc:

            raise PlaywrightDriverError(
                f"Failed to start Playwright: {exc}"
            ) from exc

        return self.playwright

    def _get_launcher(
        self,
    ) -> Any:

        if self.playwright is None:

            raise PlaywrightDriverError(
                "Playwright has not been started."
            )

        if self.browser_type == "chromium":

            return self.playwright.chromium

        if self.browser_type == "firefox":

            return self.playwright.firefox

        if self.browser_type == "webkit":

            return self.playwright.webkit

        raise PlaywrightDriverError(
            f"Unsupported browser: "
            f"{self.browser_type}"
        )

    # ==========================================================
    # Launch
    # ==========================================================

    async def launch(
        self,
        **kwargs: Any,
    ) -> Any:
        """
        Launch browser and create context/page.

        Additional kwargs are passed to Playwright's
        browser.launch().
        """

        if self.is_running:

            return self._page

        await self._start_playwright()

        launcher = self._get_launcher()

        launch_options: dict[str, Any] = {
            "headless": self.headless,
        }

        if self.args:

            launch_options[
                "args"
            ] = list(self.args)

        if self.executable_path:

            launch_options[
                "executable_path"
            ] = self.executable_path

        launch_options.update(
            kwargs
        )

        try:

            self.browser = (
                await launcher.launch(
                    **launch_options
                )
            )

        except Exception as exc:

            await self._cleanup_playwright()

            raise PlaywrightDriverError(
                f"Failed to launch "
                f"{self.browser_type}: {exc}"
            ) from exc

        context_options: dict[
            str,
            Any,
        ] = {
            "ignore_https_errors": (
                self.ignore_https_errors
            ),
            "locale": self.locale,
        }

        if self.viewport is not None:

            context_options[
                "viewport"
            ] = self.viewport

        if self.user_agent is not None:

            context_options[
                "user_agent"
            ] = self.user_agent

        if self.timezone_id is not None:

            context_options[
                "timezone_id"
            ] = self.timezone_id

        if self.proxy is not None:

            context_options[
                "proxy"
            ] = self.proxy

        try:

            self._context = (
                await self.browser.new_context(
                    **context_options
                )
            )

            self._page = (
                await self._context.new_page()
            )

            self._page.set_default_timeout(
                self.timeout
            )

            self._page.set_default_navigation_timeout(
                self.timeout
            )

        except Exception as exc:

            await self.close()

            raise PlaywrightDriverError(
                f"Failed to create "
                f"browser context/page: {exc}"
            ) from exc

        return self._page

    # ==========================================================
    # New page
    # ==========================================================

    async def new_page(
        self,
    ) -> Any:
        """
        Create a new page inside the current context.
        """

        if self._context is None:

            raise BrowserNotStartedError(
                "Browser context is not available. "
                "Call await launch() first."
            )

        try:

            page = (
                await self._context.new_page()
            )

            page.set_default_timeout(
                self.timeout
            )

            page.set_default_navigation_timeout(
                self.timeout
            )

            self._page = page

            return page

        except Exception as exc:

            raise PlaywrightDriverError(
                f"Failed to create new page: {exc}"
            ) from exc

    # ==========================================================
    # Navigation
    # ==========================================================

    async def goto(
        self,
        url: str,
        wait_until: str = "domcontentloaded",
        timeout: int | None = None,
        **kwargs: Any,
    ) -> Any:
        """
        Navigate the active page.

        Supported wait_until values include:

            commit
            domcontentloaded
            load
            networkidle
        """

        if self._page is None:

            raise BrowserNotStartedError(
                "No active page. "
                "Call await launch() first."
            )

        if not isinstance(
            url,
            str,
        ):

            raise TypeError(
                "URL must be a string."
            )

        url = url.strip()

        if not url:

            raise ValueError(
                "URL cannot be empty."
            )

        if not (
            url.startswith("http://")
            or url.startswith("https://")
        ):

            raise ValueError(
                "URL must start with "
                "http:// or https://"
            )

        try:

            return await self._page.goto(
                url,
                wait_until=wait_until,
                timeout=(
                    timeout
                    or self.timeout
                ),
                **kwargs,
            )

        except Exception as exc:

            raise PlaywrightDriverError(
                f"Navigation failed for "
                f"'{url}': {exc}"
            ) from exc

    # ==========================================================
    # Page management
    # ==========================================================

    async def close_page(
        self,
    ) -> None:
        """Close only the current page."""

        if self._page is None:
            return

        try:

            await self._page.close()

        except Exception as exc:

            raise PlaywrightDriverError(
                f"Failed to close page: {exc}"
            ) from exc

        finally:

            self._page = None

    async def reload(
        self,
        wait_until: str = "domcontentloaded",
    ) -> Any:

        if self._page is None:

            raise BrowserNotStartedError(
                "No active page."
            )

        try:

            return await self._page.reload(
                wait_until=wait_until,
                timeout=self.timeout,
            )

        except Exception as exc:

            raise PlaywrightDriverError(
                f"Page reload failed: {exc}"
            ) from exc

    async def back(
        self,
    ) -> Any:

        if self._page is None:

            raise BrowserNotStartedError(
                "No active page."
            )

        try:

            return await self._page.go_back(
                wait_until="domcontentloaded",
                timeout=self.timeout,
            )

        except Exception as exc:

            raise PlaywrightDriverError(
                f"Browser back operation failed: "
                f"{exc}"
            ) from exc

    async def forward(
        self,
    ) -> Any:

        if self._page is None:

            raise BrowserNotStartedError(
                "No active page."
            )

        try:

            return await self._page.go_forward(
                wait_until="domcontentloaded",
                timeout=self.timeout,
            )

        except Exception as exc:

            raise PlaywrightDriverError(
                f"Browser forward operation failed: "
                f"{exc}"
            ) from exc

    # ==========================================================
    # Context management
    # ==========================================================

    async def clear_cookies(
        self,
    ) -> None:

        if self._context is None:

            raise BrowserNotStartedError(
                "Browser context is not available."
            )

        await self._context.clear_cookies()

    async def add_cookies(
        self,
        cookies: list[dict[str, Any]],
    ) -> None:

        if self._context is None:

            raise BrowserNotStartedError(
                "Browser context is not available."
            )

        if not isinstance(
            cookies,
            list,
        ):

            raise TypeError(
                "cookies must be a list."
            )

        if not cookies:
            return

        await self._context.add_cookies(
            cookies
        )

    async def get_cookies(
        self,
    ) -> list[dict[str, Any]]:

        if self._context is None:

            raise BrowserNotStartedError(
                "Browser context is not available."
            )

        return await self._context.cookies()

    # ==========================================================
    # Storage
    # ==========================================================

    async def storage_state(
        self,
        path: str | None = None,
    ) -> dict[str, Any]:

        if self._context is None:

            raise BrowserNotStartedError(
                "Browser context is not available."
            )

        if path:

            await self._context.storage_state(
                path=path
            )

        return await self._context.storage_state()

    # ==========================================================
    # Screenshot
    # ==========================================================

    async def screenshot(
        self,
        path: str,
        full_page: bool = True,
    ) -> None:

        if self._page is None:

            raise BrowserNotStartedError(
                "No active page."
            )

        if not path:

            raise ValueError(
                "Screenshot path cannot be empty."
            )

        try:

            await self._page.screenshot(
                path=path,
                full_page=full_page,
            )

        except Exception as exc:

            raise PlaywrightDriverError(
                f"Screenshot failed: {exc}"
            ) from exc

    # ==========================================================
    # Page information
    # ==========================================================

    async def title(
        self,
    ) -> str:

        if self._page is None:

            raise BrowserNotStartedError(
                "No active page."
            )

        return await self._page.title()

    @property
    def url(
        self,
    ) -> str:

        if self._page is None:

            return ""

        return self._page.url

    async def content(
        self,
    ) -> str:

        if self._page is None:

            raise BrowserNotStartedError(
                "No active page."
            )

        return await self._page.content()

    # ==========================================================
    # JavaScript
    # ==========================================================

    async def evaluate(
        self,
        expression: str,
        arg: Any = None,
    ) -> Any:

        if self._page is None:

            raise BrowserNotStartedError(
                "No active page."
            )

        if not expression:

            raise ValueError(
                "JavaScript expression cannot be empty."
            )

        return await self._page.evaluate(
            expression,
            arg,
        )

    # ==========================================================
    # Wait
    # ==========================================================

    async def wait(
        self,
        milliseconds: int = 1000,
    ) -> None:

        if self._page is None:

            raise BrowserNotStartedError(
                "No active page."
            )

        if milliseconds < 0:

            raise ValueError(
                "milliseconds cannot be negative."
            )

        await self._page.wait_for_timeout(
            milliseconds
        )

    async def wait_for_url(
        self,
        url: str,
        timeout: int | None = None,
    ) -> None:

        if self._page is None:

            raise BrowserNotStartedError(
                "No active page."
            )

        await self._page.wait_for_url(
            url,
            timeout=(
                timeout
                or self.timeout
            ),
        )

    # ==========================================================
    # Context/page creation
    # ==========================================================

    async def new_context(
        self,
        **kwargs: Any,
    ) -> Any:

        if self.browser is None:

            raise BrowserNotStartedError(
                "Browser is not running."
            )

        try:

            context = (
                await self.browser.new_context(
                    **kwargs
                )
            )

            return context

        except Exception as exc:

            raise PlaywrightDriverError(
                f"Failed to create context: "
                f"{exc}"
            ) from exc

    # ==========================================================
    # Diagnostics
    # ==========================================================

    def info(
        self,
    ) -> dict[str, Any]:

        return {
            "driver": "playwright",
            "browser_type": (
                self.browser_type
            ),
            "headless": self.headless,
            "timeout": self.timeout,
            "running": self.is_running,
            "page_available": (
                self.is_page_available
            ),
            "url": self.url,
        }

    # ==========================================================
    # Cleanup
    # ==========================================================

    async def _cleanup_playwright(
        self,
    ) -> None:

        if self.playwright is not None:

            try:

                await self.playwright.stop()

            except Exception:
                pass

        self.playwright = None

    async def close(
        self,
    ) -> None:
        """
        Safely close page, context, browser,
        and Playwright.
        """

        errors: list[str] = []

        if self._page is not None:

            try:

                await self._page.close()

            except Exception as exc:

                errors.append(
                    f"page: {exc}"
                )

        if self._context is not None:

            try:

                await self._context.close()

            except Exception as exc:

                errors.append(
                    f"context: {exc}"
                )

        if self.browser is not None:

            try:

                await self.browser.close()

            except Exception as exc:

                errors.append(
                    f"browser: {exc}"
                )

        if self.playwright is not None:

            try:

                await self.playwright.stop()

            except Exception as exc:

                errors.append(
                    f"playwright: {exc}"
                )

        self._page = None
        self._context = None
        self.browser = None
        self.playwright = None

        if errors:

            raise PlaywrightDriverError(
                "Errors occurred while closing "
                "browser resources: "
                + "; ".join(errors)
            )

    # ==========================================================
    # Async context manager
    # ==========================================================

    async def __aenter__(
        self,
    ) -> "PlaywrightDriver":

        await self.launch()

        return self

    async def __aexit__(
        self,
        exc_type,
        exc_value,
        traceback,
    ) -> None:

        await self.close()