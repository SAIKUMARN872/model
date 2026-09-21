class ComputerUseError(Exception):
    """Base exception for Computer Use."""


class ComputerInitializationError(ComputerUseError):
    """Raised when the computer session cannot be initialized."""


class ComputerActionError(ComputerUseError):
    """Raised when a computer action fails."""


class ScreenCaptureError(ComputerUseError):
    """Raised when a screenshot cannot be captured."""


class UIElementNotFoundError(ComputerUseError):
    """Raised when a requested UI element cannot be found."""


class WindowNotFoundError(ComputerUseError):
    """Raised when a requested window cannot be found."""


class ApplicationNotFoundError(ComputerUseError):
    """Raised when a requested application cannot be found."""


class ApprovalRequiredError(ComputerUseError):
    """Raised when an action requires user approval."""


class SecurityViolationError(ComputerUseError):
    """Raised when a computer action violates a security policy."""


class VerificationError(ComputerUseError):
    """Raised when execution result verification fails."""
