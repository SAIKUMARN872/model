"""
Task models for the ModelNow planner.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timezone
from typing import Any, Callable
from uuid import uuid4


class TaskStatus(str, Enum):
    """Lifecycle states for planned tasks."""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"
    CANCELLED = "cancelled"


@dataclass
class PlannedTask:
    """
    Represents one executable task in a plan.
    """

    name: str
    description: str = ""

    task_id: str = field(
        default_factory=lambda: str(uuid4())
    )

    dependencies: list[str] = field(
        default_factory=list
    )

    function: Callable[..., Any] | None = None

    args: tuple[Any, ...] = ()

    kwargs: dict[str, Any] = field(
        default_factory=dict
    )

    status: TaskStatus = TaskStatus.PENDING

    result: Any = None

    error: str | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    created_at: datetime = field(
        default_factory=lambda: datetime.now(
            timezone.utc
        )
    )

    started_at: datetime | None = None

    completed_at: datetime | None = None

    def __post_init__(self) -> None:

        if not self.name.strip():
            raise ValueError(
                "Task name cannot be empty"
            )

        if self.function is not None and not callable(
            self.function
        ):
            raise TypeError(
                "Task function must be callable"
            )

        self.dependencies = list(
            dict.fromkeys(
                self.dependencies
            )
        )

    def start(self) -> None:

        if self.status != TaskStatus.PENDING:
            raise RuntimeError(
                f"Task cannot start from "
                f"{self.status.value} state"
            )

        self.status = TaskStatus.RUNNING

        self.started_at = (
            datetime.now(timezone.utc)
        )

    def complete(
        self,
        result: Any = None,
    ) -> None:

        self.status = TaskStatus.COMPLETED

        self.result = result

        self.completed_at = (
            datetime.now(timezone.utc)
        )

    def fail(
        self,
        error: str,
    ) -> None:

        self.status = TaskStatus.FAILED

        self.error = error

        self.completed_at = (
            datetime.now(timezone.utc)
        )

    def skip(
        self,
        reason: str | None = None,
    ) -> None:

        self.status = TaskStatus.SKIPPED

        self.error = reason

        self.completed_at = (
            datetime.now(timezone.utc)
        )

    def cancel(self) -> None:

        self.status = TaskStatus.CANCELLED

        self.completed_at = (
            datetime.now(timezone.utc)
        )

    @property
    def is_terminal(self) -> bool:

        return self.status in {
            TaskStatus.COMPLETED,
            TaskStatus.FAILED,
            TaskStatus.SKIPPED,
            TaskStatus.CANCELLED,
        }

    @property
    def is_successful(self) -> bool:

        return self.status == TaskStatus.COMPLETED

    def to_dict(self) -> dict[str, Any]:

        return {
            "task_id": self.task_id,
            "name": self.name,
            "description": self.description,
            "dependencies": list(
                self.dependencies
            ),
            "status": self.status.value,
            "result": self.result,
            "error": self.error,
            "metadata": dict(
                self.metadata
            ),
            "created_at": (
                self.created_at.isoformat()
            ),
            "started_at": (
                self.started_at.isoformat()
                if self.started_at
                else None
            ),
            "completed_at": (
                self.completed_at.isoformat()
                if self.completed_at
                else None
            ),
        }


class TaskRegistry:
    """
    Registry of planned tasks.
    """

    def __init__(self) -> None:

        self._tasks: dict[
            str,
            PlannedTask,
        ] = {}

    def add(
        self,
        task: PlannedTask,
    ) -> PlannedTask:

        if task.task_id in self._tasks:
            raise ValueError(
                f"Task already exists: "
                f"{task.task_id}"
            )

        self._tasks[
            task.task_id
        ] = task

        return task

    def get(
        self,
        task_id: str,
    ) -> PlannedTask | None:

        return self._tasks.get(
            task_id
        )

    def require(
        self,
        task_id: str,
    ) -> PlannedTask:

        task = self.get(task_id)

        if task is None:
            raise KeyError(
                f"Task not found: {task_id}"
            )

        return task

    def remove(
        self,
        task_id: str,
    ) -> bool:

        if task_id not in self._tasks:
            return False

        del self._tasks[
            task_id
        ]

        return True

    def all(
        self,
    ) -> list[PlannedTask]:

        return list(
            self._tasks.values()
        )

    def clear(self) -> None:

        self._tasks.clear()

    def __len__(self) -> int:

        return len(self._tasks)