"""
Planning package for browser automation agents.
"""

from .goals import (
    Goal,
    GoalManager,
    GoalStatus,
)

from .planner import (
    ExecutionPlan,
    Planner,
)

from .tasks import (
    PlanTask,
    PlanTaskStatus,
    TaskGraph,
)

from .utils import (
    clean_goal,
    dependency_levels,
    estimate_task_count,
    normalize_task_name,
    summarize_plan,
)


__all__ = [
    "Goal",
    "GoalManager",
    "GoalStatus",
    "ExecutionPlan",
    "Planner",
    "PlanTask",
    "PlanTaskStatus",
    "TaskGraph",
    "clean_goal",
    "dependency_levels",
    "estimate_task_count",
    "normalize_task_name",
    "summarize_plan",
]


__version__ = "1.0.0"