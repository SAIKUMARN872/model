"""
Planning task definitions.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Awaitable
from uuid import uuid4


class PlanTaskStatus(
    str,
    Enum,
):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"
    CANCELLED = "cancelled"


@dataclass
class PlanTask:
    """Represents one executable planning task."""

    name: str

    action: Callable[
        [], Awaitable[Any]
    ] | None = None

    task_id: str = field(
        default_factory=lambda:
        f"plan_task_{uuid4().hex}"
    )

    dependencies: list[str] = field(
        default_factory=list
    )

    priority: int = 0

    status: PlanTaskStatus = (
        PlanTaskStatus.PENDING
    )

    result: Any = None

    error: str | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        self.name = self.name.strip()

        if not self.name:

            raise ValueError(
                "Task name cannot be empty."
            )

    def can_run(
        self,
        completed_ids: set[str],
    ) -> bool:

        return all(
            dependency in completed_ids
            for dependency in self.dependencies
        )


class TaskGraph:
    """Dependency-aware collection of planning tasks."""

    def __init__(self) -> None:

        self._tasks: dict[
            str,
            PlanTask,
        ] = {}

    def add(
        self,
        task: PlanTask,
    ) -> None:

        if task.task_id in self._tasks:

            raise ValueError(
                f"Task '{task.task_id}' already exists."
            )

        for dependency in task.dependencies:

            if dependency == task.task_id:

                raise ValueError(
                    "A task cannot depend on itself."
                )

        self._tasks[
            task.task_id
        ] = task

    def get(
        self,
        task_id: str,
    ) -> PlanTask | None:

        return self._tasks.get(
            task_id
        )

    def all(
        self,
    ) -> list[PlanTask]:

        return sorted(
            self._tasks.values(),
            key=lambda task: (
                -task.priority,
                task.task_id,
            ),
        )

    def ready(
        self,
        completed_ids: set[str],
    ) -> list[PlanTask]:

        return [
            task
            for task in self._tasks.values()
            if (
                task.status
                == PlanTaskStatus.PENDING
                and task.can_run(
                    completed_ids
                )
            )
        ]

    def validate(
        self,
    ) -> None:

        task_ids = set(
            self._tasks.keys()
        )

        for task in self._tasks.values():

            missing = (
                set(task.dependencies)
                - task_ids
            )

            if missing:

                raise ValueError(
                    f"Task '{task.name}' has "
                    f"missing dependencies: "
                    f"{sorted(missing)}"
                )

        self._check_cycles()

    def _check_cycles(
        self,
    ) -> None:

        visited: set[str] = set()
        visiting: set[str] = set()

        def visit(
            task_id: str,
        ) -> None:

            if task_id in visiting:

                raise ValueError(
                    "Circular task dependency detected."
                )

            if task_id in visited:
                return

            visiting.add(
                task_id
            )

            task = self._tasks[
                task_id
            ]

            for dependency in task.dependencies:
                visit(dependency)

            visiting.remove(
                task_id
            )

            visited.add(
                task_id
            )

        for task_id in self._tasks:

            visit(task_id)

    def clear(self) -> None:

        self._tasks.clear()

    def __len__(
        self,
    ) -> int:

        return len(
            self._tasks
        )