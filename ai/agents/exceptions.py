"""
Exceptions for the ModelNow tool system.
"""


class ToolError(Exception):
    """Base exception for all tool errors."""


class ToolNotFoundError(ToolError):
    """Raised when a requested tool does not exist."""


class ToolRegistrationError(ToolError):
    """Raised when tool registration fails."""


class ToolExecutionError(ToolError):
    """Raised when tool execution fails."""


class ToolValidationError(ToolError):
    """Raised when tool input is invalid."""


class ToolTimeoutError(ToolExecutionError):
    """Raised when a tool exceeds its execution timeout."""


class ToolPermissionError(ToolError):
    """Raised when execution is not permitted."""


class ToolConfigurationError(ToolError):
    """Raised when tool configuration is invalid."""


class ToolLimitExceededError(ToolError):
    """Raised when the tool-call limit is exceeded."""