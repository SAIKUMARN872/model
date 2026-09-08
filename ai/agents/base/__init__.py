"""
Base agent package for ModelNow.

This package contains the foundational abstractions
used by all specialized ModelNow agents.
"""

from .agent import (
    AgentIterationLimitError,
    BaseAgent,
    BaseAgentConfig,
    BaseAgentConfigurationError,
    BaseAgentError,
    BaseAgentExecutionError,
    BaseAgentResult,
)

from .context import (
    BaseAgentContext,
    Tool,
)

from .state import (
    AgentStateError,
    AgentStateManager,
    AgentStatus,
    BaseAgentState,
    InvalidStateTransitionError,
)

from .utils import (
    ensure_callable,
    execute,
    is_async_callable,
    merge_metadata,
    normalize_input,
    normalize_output,
    run_sync,
    safe_error,
    truncate,
    validate_agent_name,
    validate_max_iterations,
)


__all__ = [
    # Agent
    "BaseAgent",
    "BaseAgentConfig",
    "BaseAgentResult",
    "BaseAgentError",
    "BaseAgentConfigurationError",
    "BaseAgentExecutionError",
    "AgentIterationLimitError",

    # Context
    "BaseAgentContext",
    "Tool",

    # State
    "BaseAgentState",
    "AgentStateManager",
    "AgentStatus",
    "AgentStateError",
    "InvalidStateTransitionError",

    # Utilities
    "ensure_callable",
    "execute",
    "is_async_callable",
    "merge_metadata",
    "normalize_input",
    "normalize_output",
    "run_sync",
    "safe_error",
    "truncate",
    "validate_agent_name",
    "validate_max_iterations",
]


__version__ = "1.0.0"