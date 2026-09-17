"""
AI platform package.

Provides the central engine, models, interfaces,
exceptions and session management.
"""

from .constants import (
    DEFAULT_MAX_CONCURRENCY,
    DEFAULT_MAX_RETRIES,
    DEFAULT_TIMEOUT,
    PACKAGE_NAME,
    PACKAGE_VERSION,
)

from .engine import (
    AIEngine,
)

from .exceptions import (
    AgentError,
    AIError,
    ConfigurationError,
    ExecutionError,
    NavigationError,
    PlanningError,
    ProviderError,
    RateLimitError,
    ScrapingError,
    SecurityError,
    SessionError,
    TimeoutError,
    ToolError,
    ValidationError,
)

from .interfaces import (
    Agent,
    AIProvider,
    BrowserInterface,
    EmbeddingProvider,
    MemoryInterface,
    PlannerInterface,
    Tool,
)

from .models import (
    AIRequest,
    AIResponse,
    Message,
    ToolCall,
)

from .schemas import (
    AgentRequestSchema,
    ChatSchema,
    ExecutionSchema,
    HealthSchema,
    ToolRequestSchema,
)

from .session import (
    Session,
    SessionEvent,
    SessionManager,
    SessionState,
)


__all__ = [
    "AIEngine",

    "AIError",
    "ConfigurationError",
    "ValidationError",
    "SessionError",
    "AgentError",
    "PlanningError",
    "ExecutionError",
    "NavigationError",
    "ScrapingError",
    "SecurityError",
    "ToolError",
    "TimeoutError",
    "RateLimitError",
    "ProviderError",

    "AIProvider",
    "Agent",
    "Tool",
    "PlannerInterface",
    "MemoryInterface",
    "BrowserInterface",
    "EmbeddingProvider",

    "AIRequest",
    "AIResponse",
    "Message",
    "ToolCall",

    "ChatSchema",
    "AgentRequestSchema",
    "ToolRequestSchema",
    "ExecutionSchema",
    "HealthSchema",

    "Session",
    "SessionEvent",
    "SessionManager",
    "SessionState",

    "PACKAGE_NAME",
    "PACKAGE_VERSION",
    "DEFAULT_TIMEOUT",
    "DEFAULT_MAX_RETRIES",
    "DEFAULT_MAX_CONCURRENCY",
]


__version__ = PACKAGE_VERSION