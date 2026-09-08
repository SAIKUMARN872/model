"""
Workflow representation for ModelNow planners.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Callable

from .tasks import (
    PlannedTask,
    TaskRegistry,
)
from .utils import (
    topological_sort,
    validate_dependencies,
)


class WorkflowError(Exception):
    """Base workflow exception."""


@dataclass
class Workflow:
    """
    Represents a complete executable workflow.
    """

    name: str

    workflow_id: str

    description: str = ""

    tasks: TaskRegistry = field(
        default_factory=TaskRegistry
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    created_at: datetime = field(
        default_factory=lambda: datetime.now(
            timezone.utc
        )
    )

    def add_task(
        self,
        task: PlannedTask,
    ) -> PlannedTask:

        self.tasks.add(
            task
        )

        return task

    def get_task(
        self,
        task_id: str,
    ) -> PlannedTask:

        return self.tasks.require(
            task_id
        )

    def validate(self) -> None:

        validate_dependencies(
            self.tasks.all()
        )

    def execution_order(
        self,
    ) -> list[PlannedTask]:

        self.validate()

        return topological_sort(
            self.tasks.all()
        )

    def to_dict(self) -> dict[str, Any]:

        return {
            "workflow_id": self.workflow_id,
            "name": self.name,
            "description": self.description,
            "tasks": [
                task.to_dict()
                for task in self.tasks.all()
            ],
            "metadata": dict(
                self.metadata
            ),
            "created_at": (
                self.created_at.isoformat()
            ),
        }


class WorkflowBuilder:
    """
    Fluent builder for workflows.
    """

    def __init__(
        self,
        name: str,
        workflow_id: str | None = None,
        description: str = "",
    ) -> None:

        from uuid import uuid4

        self.workflow = Workflow(
            name=name,
            workflow_id=(
                workflow_id
                or str(uuid4())
            ),
            description=description,
        )

    def task(
        self,
        name: str,
        function: Callable[..., Any] | None = None,
        description: str = "",
        depends_on: list[str] | None = None,
        args: tuple[Any, ...] = (),
        kwargs: dict[str, Any] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> "WorkflowBuilder":

        task = PlannedTask(
            name=name,
            description=description,
            function=function,
            dependencies=(
                depends_on or []
            ),
            args=args,
            kwargs=kwargs or {},
            metadata=metadata or {},
        )

        self.workflow.add_task(
            task
        )

        return self

    def build(
        self,
    ) -> Workflow:

        self.workflow.validate()

        return self.workflow