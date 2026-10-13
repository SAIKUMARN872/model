class BrowserAutomationError(Exception):
    """Base error for browser automation."""


class InvalidBrowserTaskError(BrowserAutomationError):
    """The requested task is invalid."""


class UnsafeUrlError(InvalidBrowserTaskError):
    """The requested URL is not allowed."""


class BrowserUnavailableError(BrowserAutomationError):
    """A browser could not be started or accessed."""


class ApprovalRequiredError(BrowserAutomationError):
    """A sensitive action needs explicit approval."""


class BrowserActionError(BrowserAutomationError):
    """A browser action failed."""
