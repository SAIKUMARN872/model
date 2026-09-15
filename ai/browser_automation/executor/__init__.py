"""
Automation execution package.
"""

from .executor import (
    ExecutionResult,
    ExecutionStatus,
    ExecutionTask,
    TaskExecutor,
)

from .runner import (
    AutomationRunner,
)

from .worker import (
    ExecutionWorker,
)


__all__ = [
    "ExecutionTask",
    "ExecutionResult",
    "ExecutionStatus",
    "TaskExecutor",
    "AutomationRunner",
    "ExecutionWorker",
]


__version__ = "1.0.0"