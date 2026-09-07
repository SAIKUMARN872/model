"""
Agent manager package.

Public API for registration, lifecycle management,
scheduling and agent utilities.
"""

from .lifecycle import (
    AgentLifecycle,
    LifecycleError,
    LifecycleState,
)

from .manager import (
    AgentAlreadyExistsError,
    AgentManager,
    AgentManagerError,
    AgentNotFoundError,
)

from .scheduler import (
    AgentScheduler,
    ScheduledTask,
)

from .utils import (
    agent_info,
    get_agent_metadata,
    get_agent_name,
    is_agent_running,
    merge_agent_metadata,
    safe_call,
    validate_agent_id,
)


__all__ = [
    # Lifecycle
    "AgentLifecycle",
    "LifecycleError",
    "LifecycleState",

    # Manager
    "AgentManager",
    "AgentManagerError",
    "AgentAlreadyExistsError",
    "AgentNotFoundError",

    # Scheduler
    "AgentScheduler",
    "ScheduledTask",

    # Utilities
    "validate_agent_id",
    "get_agent_name",
    "get_agent_metadata",
    "agent_info",
    "merge_agent_metadata",
    "is_agent_running",
    "safe_call",
]