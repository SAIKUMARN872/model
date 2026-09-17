"""
Goal-to-task planner.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Awaitable, Callable

from .goals import (
    Goal,
)
from .tasks import (
    PlanTask,
    TaskGraph,
)
from .utils import (
    clean_goal,
    summarize_plan,
)


@dataclass
class ExecutionPlan:
    """Executable plan generated for a goal."""

    goal: Goal

    tasks: TaskGraph = field(
        default_factory=TaskGraph
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def validate(self) -> None:

        self.tasks.validate()

    def summary(
        self,
    ) -> dict[str, Any]:

        task_list = self.tasks.all()

        return {
            "goal_id": self.goal.goal_id,
            "goal": self.goal.description,
            **summarize_plan(
                task_list
            ),
        }


class Planner:
    """
    General-purpose automation planner.

    Tasks can be supplied by an AI agent or application
    layer and then organized into a dependency graph.
    """

    def create_plan(
        self,
        goal: Goal,
    ) -> ExecutionPlan:

        goal.description = clean_goal(
            goal.description
        )

        goal.activate()

        return ExecutionPlan(
            goal=goal
        )

    def add_task(
        self,
        plan: ExecutionPlan,
        name: str,
        action: Callable[
            [], Awaitable[Any]
        ] | None = None,
        dependencies: list[str] | None = None,
        priority: int = 0,
        **metadata: Any,
    ) -> PlanTask:

        task = PlanTask(
            name=name,
            action=action,
            dependencies=(
                dependencies or []
            ),
            priority=priority,
            metadata=metadata,
        )

        plan.tasks.add(
            task
        )

        return task

    def validate(
        self,
        plan: ExecutionPlan,
    ) -> None:

        plan.validate()

    def ready_tasks(
        self,
        plan: ExecutionPlan,
        completed_ids: set[str] | None = None,
    ) -> list[PlanTask]:

        return plan.tasks.ready(
            completed_ids or set()
        )

    def build_linear_plan(
        self,
        goal: Goal,
        tasks: list[
            tuple[
                str,
                Callable[
                    [], Awaitable[Any]
                ] | None,
            ]
        ],
    ) -> ExecutionPlan:

        plan = self.create_plan(
            goal
        )

        previous_id: str | None = None

        for name, action in tasks:

            dependencies = (
                [previous_id]
                if previous_id
                else []
            )

            task = self.add_task(
                plan,
                name,
                action,
                dependencies=dependencies,
            )

            previous_id = task.task_id

        plan.validate()

        return plan