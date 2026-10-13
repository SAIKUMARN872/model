from __future__ import annotations


class AgentError(Exception):
    """Base exception for agent execution errors."""


class AgentValidationError(AgentError):
    """Raised when an agent request or response is invalid."""


class AgentExecutionError(AgentError):
    """Raised when agent execution fails."""


class AgentStateError(AgentError):
    """Raised when an agent lifecycle transition is invalid."""


__all__ = [
    "AgentError",
    "AgentValidationError",
    "AgentExecutionError",
    "AgentStateError",
]
