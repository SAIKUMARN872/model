"""
Main planning engine for ModelNow.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable
from uuid import uuid4

from .tasks import (
    PlannedTask,
    TaskStatus,
)
from .utils import (
    get_ready_tasks,
    plan_progress,
)
from .workflow import (
    Workflow,
    WorkflowBuilder,
)


class PlannerError(Exception):
    """Base planner exception."""


class PlanningError(
    PlannerError
):
    """Raised when a plan cannot be created."""


@dataclass
class PlanRequest:
    """
    Request for creating a workflow plan.
    """

    goal: str

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    max_tasks: int = 20

    def __post_init__(self) -> None:

        if not self.goal.strip():
            raise ValueError(
                "Planning goal cannot be empty"
            )

        if self.max_tasks <= 0:
            raise ValueError(
                "max_tasks must be positive"
            )


@dataclass
class PlanResult:
    """
    Result returned by the planner.
    """

    success: bool

    workflow: Workflow | None = None

    error: str | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "success": self.success,
            "workflow": (
                self.workflow.to_dict()
                if self.workflow
                else None
            ),
            "error": self.error,
            "metadata": dict(
                self.metadata
            ),
        }


class Planner:
    """
    Main ModelNow workflow planner.

    A plan handler can be connected to an LLM or
    another planning system.

    Expected handler output:

        [
            {
                "name": "task_a",
                "description": "...",
                "depends_on": []
            },
            {
                "name": "task_b",
                "description": "...",
                "depends_on": ["task_a"]
            }
        ]
    """

    def __init__(
        self,
        plan_handler: Callable[..., Any] | None = None,
    ) -> None:

        self.plan_handler = plan_handler

    async def create_plan(
        self,
        request: PlanRequest,
    ) -> PlanResult:

        if self.plan_handler is None:

            return PlanResult(
                success=False,
                error=(
                    "No plan handler configured"
                ),
            )

        try:

            from .utils import execute_handler

            raw_plan = await execute_handler(
                self.plan_handler,
                request,
            )

            workflow = self._build_workflow(
                request,
                raw_plan,
            )

            return PlanResult(
                success=True,
                workflow=workflow,
                metadata=request.metadata,
            )

        except Exception as exc:

            return PlanResult(
                success=False,
                error=str(exc),
                metadata=request.metadata,
            )

    def _build_workflow(
        self,
        request: PlanRequest,
        raw_plan: Any,
    ) -> Workflow:

        if not isinstance(
            raw_plan,
            list,
        ):
            raise PlanningError(
                "Plan handler must return a list"
            )

        if len(raw_plan) > request.max_tasks:

            raise PlanningError(
                f"Plan contains more than "
                f"{request.max_tasks} tasks"
            )

        builder = WorkflowBuilder(
            name="generated-workflow",
            workflow_id=str(uuid4()),
            description=request.goal,
        )

        task_name_to_id: dict[
            str,
            str,
        ] = {}

        pending_tasks = []

        for item in raw_plan:

            if not isinstance(
                item,
                dict,
            ):
                raise PlanningError(
                    "Each planned task must be a dictionary"
                )

            name = str(
                item.get(
                    "name",
                    "",
                )
            ).strip()

            if not name:

                raise PlanningError(
                    "Every task must have a name"
                )

            pending_tasks.append(
                item
            )

        # First create task IDs.
        for item in pending_tasks:

            name = str(
                item["name"]
            ).strip()

            if name in task_name_to_id:

                raise PlanningError(
                    f"Duplicate task name: {name}"
                )

            task_name_to_id[name] = str(
                uuid4()
            )

        # Create tasks with translated dependencies.
        for item in pending_tasks:

            name = str(
                item["name"]
            ).strip()

            raw_dependencies = item.get(
                "depends_on",
                item.get(
                    "dependencies",
                    [],
                ),
            )

            dependencies = []

            for dependency in (
                raw_dependencies or []
            ):

                dependency = str(
                    dependency
                ).strip()

                if dependency not in task_name_to_id:

                    raise PlanningError(
                        f"Unknown dependency "
                        f"'{dependency}' for task "
                        f"'{name}'"
                    )

                dependencies.append(
                    task_name_to_id[
                        dependency
                    ]
                )

            task = PlannedTask(
                task_id=task_name_to_id[
                    name
                ],
                name=name,
                description=str(
                    item.get(
                        "description",
                        "",
                    )
                ),
                dependencies=dependencies,
                metadata=dict(
                    item.get(
                        "metadata",
                        {},
                    )
                ),
            )

            builder.workflow.add_task(
                task
            )

        workflow = builder.build()

        workflow.metadata.update(
            request.metadata
        )

        return workflow

    @staticmethod
    def ready_tasks(
        workflow: Workflow,
    ) -> list[PlannedTask]:

        return get_ready_tasks(
            workflow.tasks.all()
        )

    @staticmethod
    def progress(
        workflow: Workflow,
    ) -> float:

        return plan_progress(
            workflow.tasks.all()
        )

    @staticmethod
    def next_task(
        workflow: Workflow,
    ) -> PlannedTask | None:

        ready = get_ready_tasks(
            workflow.tasks.all()
        )

        if not ready:
            return None

        return ready[0]

    def create_simple_plan(
        self,
        goal: str,
        tasks: list[str],
    ) -> Workflow:

        builder = WorkflowBuilder(
            name="simple-workflow",
            description=goal,
        )

        previous_task: str | None = None

        for name in tasks:

            dependencies = (
                [previous_task]
                if previous_task
                else []
            )

            task = PlannedTask(
                name=name,
                dependencies=dependencies,
            )

            builder.workflow.add_task(
                task
            )

            previous_task = (
                task.task_id
            )

        return builder.build()