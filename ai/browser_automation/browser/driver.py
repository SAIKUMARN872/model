"""
Generic browser driver interface.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class BrowserDriver(ABC):
    """
    Abstract browser driver.

    Implement this interface for Playwright,
    Selenium, or another automation backend.
    """

    @abstractmethod
    async def launch(
        self,
        **kwargs: Any,
    ) -> Any:
        """Launch browser."""
        raise NotImplementedError

    @abstractmethod
    async def new_page(
        self,
    ) -> Any:
        """Create a page."""
        raise NotImplementedError

    @abstractmethod
    async def close(
        self,
    ) -> None:
        """Close browser."""
        raise NotImplementedError

    @abstractmethod
    async def goto(
        self,
        url: str,
        **kwargs: Any,
    ) -> Any:
        """Navigate to URL."""
        raise NotImplementedError

    @property
    @abstractmethod
    def is_running(
        self,
    ) -> bool:
        """Return browser status."""
        raise NotImplementedError


class DriverRegistry:
    """Registry for browser drivers."""

    def __init__(self) -> None:

        self._drivers: dict[
            str,
            BrowserDriver,
        ] = {}

    def register(
        self,
        name: str,
        driver: BrowserDriver,
        overwrite: bool = False,
    ) -> None:

        name = name.strip().lower()

        if (
            name in self._drivers
            and not overwrite
        ):

            raise ValueError(
                f"Driver '{name}' already exists."
            )

        self._drivers[
            name
        ] = driver

    def get(
        self,
        name: str,
    ) -> BrowserDriver:

        name = name.strip().lower()

        if name not in self._drivers:

            raise KeyError(
                f"Driver '{name}' not found."
            )

        return self._drivers[
            name
        ]

    def remove(
        self,
        name: str,
    ) -> BrowserDriver | None:

        return self._drivers.pop(
            name.strip().lower(),
            None,
        )

    def names(self) -> list[str]:

        return list(
            self._drivers.keys()
        )