"""
Browser driver abstractions for ModelNow browser automation.

This module defines the common interface that browser backends
must implement. Playwright is the primary implementation, but
the interface allows future Selenium or other drivers.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class BrowserDriverError(Exception):
    """Base exception for browser driver errors."""


class BrowserNotStartedError(
    BrowserDriverError
):
    """Raised when an operation requires a running browser."""


class BrowserDriver(ABC):
    """
    Abstract interface for browser drivers.

    Implementations must provide:

        launch()
        new_page()
        goto()
        close()
        is_running
    """

    @abstractmethod
    async def launch(
        self,
        **kwargs: Any,
    ) -> Any:
        """
        Start the browser.

        Returns:
            Browser page/context object depending on implementation.
        """
        raise NotImplementedError

    @abstractmethod
    async def new_page(
        self,
    ) -> Any:
        """
        Create and return a new browser page.
        """
        raise NotImplementedError

    @abstractmethod
    async def goto(
        self,
        url: str,
        **kwargs: Any,
    ) -> Any:
        """
        Navigate the active page to a URL.
        """
        raise NotImplementedError

    @abstractmethod
    async def close(
        self,
    ) -> None:
        """
        Shut down the browser and release resources.
        """
        raise NotImplementedError

    @property
    @abstractmethod
    def is_running(
        self,
    ) -> bool:
        """
        Return True when the browser is running.
        """
        raise NotImplementedError

    @property
    def page(self) -> Any:
        """
        Return the current active page.

        Concrete drivers should expose a page attribute.
        """

        raise NotImplementedError(
            "Driver does not expose a page."
        )

    @property
    def context(self) -> Any:
        """
        Return the current browser context.
        """

        raise NotImplementedError(
            "Driver does not expose a context."
        )


class DriverRegistry:
    """
    Registry for browser driver implementations.

    Example:

        registry = DriverRegistry()

        registry.register(
            "playwright",
            playwright_driver
        )

        driver = registry.get("playwright")
    """

    def __init__(self) -> None:

        self._drivers: dict[
            str,
            BrowserDriver,
        ] = {}

    @staticmethod
    def _normalize_name(
        name: str,
    ) -> str:

        if not isinstance(
            name,
            str,
        ):

            raise TypeError(
                "Driver name must be a string."
            )

        name = name.strip().lower()

        if not name:

            raise ValueError(
                "Driver name cannot be empty."
            )

        return name

    def register(
        self,
        name: str,
        driver: BrowserDriver,
        overwrite: bool = False,
    ) -> BrowserDriver:

        name = self._normalize_name(
            name
        )

        if not isinstance(
            driver,
            BrowserDriver,
        ):

            raise TypeError(
                "driver must implement BrowserDriver."
            )

        if (
            name in self._drivers
            and not overwrite
        ):

            raise ValueError(
                f"Driver '{name}' is already registered."
            )

        self._drivers[
            name
        ] = driver

        return driver

    def get(
        self,
        name: str,
    ) -> BrowserDriver:

        name = self._normalize_name(
            name
        )

        driver = self._drivers.get(
            name
        )

        if driver is None:

            available = ", ".join(
                self._drivers.keys()
            )

            raise KeyError(
                f"Driver '{name}' not found. "
                f"Available drivers: "
                f"{available or 'none'}"
            )

        return driver

    def remove(
        self,
        name: str,
    ) -> BrowserDriver | None:

        name = self._normalize_name(
            name
        )

        return self._drivers.pop(
            name,
            None,
        )

    def exists(
        self,
        name: str,
    ) -> bool:

        name = self._normalize_name(
            name
        )

        return name in self._drivers

    def names(
        self,
    ) -> list[str]:

        return list(
            self._drivers.keys()
        )

    def clear(self) -> None:

        self._drivers.clear()

    def __len__(
        self,
    ) -> int:

        return len(
            self._drivers
        )

    def __contains__(
        self,
        name: str,
    ) -> bool:

        return self.exists(
            name
        )


def ensure_running(
    driver: BrowserDriver,
) -> BrowserDriver:
    """
    Ensure that a driver is currently running.
    """

    if not driver.is_running:

        raise BrowserNotStartedError(
            "Browser driver is not running. "
            "Call await driver.launch() first."
        )

    return driver