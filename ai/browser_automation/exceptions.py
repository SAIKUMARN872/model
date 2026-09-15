"""
Exceptions used by the AI platform.
"""


class AIError(Exception):
    """Base exception for the AI platform."""


class ConfigurationError(
    AIError
):
    """Invalid platform configuration."""


class ValidationError(
    AIError
):
    """Invalid input or request."""


class SessionError(
    AIError
):
    """Session-related failure."""


class AgentError(
    AIError
):
    """Agent execution failure."""


class PlanningError(
    AIError
):
    """Planning failure."""


class ExecutionError(
    AIError
):
    """Execution failure."""


class NavigationError(
    AIError
):
    """Navigation failure."""


class ScrapingError(
    AIError
):
    """Scraping failure."""


class SecurityError(
    AIError
):
    """Security policy violation."""


class ToolError(
    AIError
):
    """Tool execution failure."""


class TimeoutError(
    AIError
):
    """Operation timeout."""


class RateLimitError(
    AIError
):
    """Rate limit exceeded."""


class ProviderError(
    AIError
):
    """External provider failure."""