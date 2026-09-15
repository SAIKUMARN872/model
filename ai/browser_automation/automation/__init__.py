"""
Browser automation workflow package.
"""

from .automation import (
    AutomationEngine,
)

from .tasks import (
    AutomationTask,
    TaskExecutor,
    TaskQueue,
    TaskStatus,
)

from .workflow import (
    Workflow,
    WorkflowManager,
    WorkflowResult,
    WorkflowStep,
)


__all__ = [
    "AutomationEngine",
    "AutomationTask",
    "TaskExecutor",
    "TaskQueue",
    "TaskStatus",
    "Workflow",
    "WorkflowManager",
    "WorkflowResult",
    "WorkflowStep",
]


__version__ = "1.0.0"