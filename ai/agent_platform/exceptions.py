class AgentPlatformError(Exception):
    """Base exception for agent platform errors."""


class AgentRegistrationError(AgentPlatformError):
    """Raised when an agent cannot be registered."""


class AgentNotFoundError(AgentPlatformError):
    """Raised when a requested agent is not registered."""


class AgentExecutionError(AgentPlatformError):
    """Raised when agent execution fails."""


class AgentValidationError(AgentPlatformError):
    """Raised when agent metadata or input is invalid."""
