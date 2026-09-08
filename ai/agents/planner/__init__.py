"""
ModelNow Planner package.

Provides task planning, dependency management,
workflow construction, and execution planning.
"""

from .planner import (
    PlanRequest,
    PlanResult,
    Planner,
    PlannerError,
    PlanningError,
)

from .tasks import (
    PlannedTask,
    TaskRegistry,
    TaskStatus,
)

from .utils import (
    completed_count,
    detect_cycles,
    failed_count,
    get_ready_tasks,
    has_failed_dependency,
    plan_progress,
    topological_sort,
    validate_dependencies,
)

from .workflow import (
    Workflow,
    WorkflowBuilder,
    WorkflowError,
)


__all__ = [
    # Planner
    "Planner",
    "PlanRequest",
    "PlanResult",
    "PlannerError",
    "PlanningError",

    # Tasks
    "PlannedTask",
    "TaskRegistry",
    "TaskStatus",

    # Workflow
    "Workflow",
    "WorkflowBuilder",
    "WorkflowError",

    # Utilities
    "validate_dependencies",
    "detect_cycles",
    "topological_sort",
    "get_ready_tasks",
    "has_failed_dependency",
    "completed_count",
    "failed_count",
    "plan_progress",
]


__version__ = "1.0.0"