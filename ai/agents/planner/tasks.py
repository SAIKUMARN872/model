"""Task and plan data structures."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any

from .utils import validate_name


class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"


@dataclass
class PlanTask:
    task_id: str
    description: str
    dependencies: list[str] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)
    status: TaskStatus = TaskStatus.PENDING
    result: Any = None
    error: str | None = None

    def __post_init__(self) -> None:
        self.task_id = validate_name(self.task_id, "task_id")
        self.description = validate_name(self.description, "description")
        if len(set(self.dependencies)) != len(self.dependencies):
            raise ValueError("A task cannot contain duplicate dependencies.")
        self.dependencies = [
            validate_name(item, "dependency") for item in self.dependencies
        ]
        if not isinstance(self.metadata, dict):
            raise ValueError("metadata must be a dictionary.")
        self.metadata = dict(self.metadata)
        if not isinstance(self.status, TaskStatus):
            self.status = TaskStatus(self.status)


@dataclass
class TaskPlan:
    goal: str
    tasks: list[PlanTask]
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        self.goal = validate_name(self.goal, "goal")
        if not self.tasks:
            raise ValueError("A plan must contain at least one task.")
        if not all(isinstance(task, PlanTask) for task in self.tasks):
            raise ValueError("tasks must contain PlanTask instances.")
        ids = [task.task_id for task in self.tasks]
        if len(ids) != len(set(ids)):
            raise ValueError("Task IDs must be unique.")
        if not isinstance(self.metadata, dict):
            raise ValueError("metadata must be a dictionary.")
        self.metadata = dict(self.metadata)
