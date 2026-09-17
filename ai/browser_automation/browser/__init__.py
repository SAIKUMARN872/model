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
    DriverRegistry,
)

from .playwright import (
    PlaywrightDriver,
)


__all__ = [
    "Browser",
    "BrowserError",
    "ChromiumBrowser",
    "BrowserDriver",
    "DriverRegistry",
    "PlaywrightDriver",
]


__version__ = "1.0.0"