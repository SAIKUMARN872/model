"""
Browser management package.
"""

from .browser import (
    Browser,
    BrowserError,
)

from .chromium import (
    ChromiumBrowser,
)

from .driver import (
    BrowserDriver,
    BrowserDriverError,
    BrowserNotStartedError,
    DriverRegistry,
    ensure_running,
)

from .playwright import (
    PlaywrightDriver,
    PlaywrightDriverError,
)


__all__ = [
    "Browser",
    "BrowserError",
    "ChromiumBrowser",
    "BrowserDriver",
    "BrowserDriverError",
    "BrowserNotStartedError",
    "DriverRegistry",
    "ensure_running",
    "PlaywrightDriver",
    "PlaywrightDriverError",
]


__version__ = "1.0.0"