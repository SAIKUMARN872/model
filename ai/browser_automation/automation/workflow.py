"""
Browser automation workflow orchestration.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Awaitable, Callable

from .tasks import (
    AutomationTask,
    TaskExecutor,
    TaskQueue,
    TaskStatus,
)
from .utils import (
    build_result,
    generate_id,
    validate_name,
)


@dataclass
class WorkflowStep:
    """A single workflow step."""

    name: str

    action: Callable[
        [], Awaitable[Any]
    ]

    step_id: str = field(
        default_factory=lambda:
        generate_id("step")
    )

    continue_on_error: bool = False

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        self.name = validate_name(
            self.name
        )

        if not callable(self.action):
            raise TypeError(
                "Workflow action must be callable."
            )


@dataclass
class WorkflowResult:
    """Result of workflow execution."""

    workflow_id: str

    name: str

    success: bool

    steps: list[dict[str, Any]]

    error: str | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


class Workflow:
    """
    Sequential browser automation workflow.

    Example:

        workflow = Workflow("login")

        workflow.add_step(
            "open",
            lambda: actions.goto(url)
        )

        workflow.add_step(
            "fill_email",
            lambda: actions.fill(
                "#email",
                email
            )
        )

        result = await workflow.run()
    """

    def __init__(
        self,
        name: str,
        workflow_id: str | None = None,
    ) -> None:

        self.name = validate_name(
            name
        )

        self.workflow_id = (
            workflow_id
            or generate_id("workflow")
        )

        self.steps: list[
            WorkflowStep
        ] = []

        self.executor = TaskExecutor()

    def add_step(
        self,
        name: str,
        action: Callable[
            [], Awaitable[Any]
        ],
        continue_on_error: bool = False,
        **metadata: Any,
    ) -> WorkflowStep:

        step = WorkflowStep(
            name=name,
            action=action,
            continue_on_error=(
                continue_on_error
            ),
            metadata=metadata,
        )

        self.steps.append(
            step
        )

        return step

    def add(
        self,
        step: WorkflowStep,
    ) -> WorkflowStep:

        self.steps.append(
            step
        )

        return step

    def remove_step(
        self,
        step_id: str,
    ) -> bool:

        original = len(
            self.steps
        )

        self.steps = [
            step
            for step in self.steps
            if step.step_id != step_id
        ]

        return len(
            self.steps
        ) < original

    def clear(self) -> None:

        self.steps.clear()

    async def run(
        self,
    ) -> WorkflowResult:

        results = []

        for step in self.steps:

            task = AutomationTask(
                name=step.name,
                action=step.action,
                metadata=step.metadata,
            )

            task = await self.executor.execute(
                task
            )

            step_result = {
                "step_id": step.step_id,
                "name": step.name,
                "status": task.status.value,
                "success": (
                    task.status
                    == TaskStatus.COMPLETED
                ),
                "result": task.result,
                "error": task.error,
            }

            results.append(
                step_result
            )

            if (
                task.status
                == TaskStatus.FAILED
                and not step.continue_on_error
            ):

                return WorkflowResult(
                    workflow_id=(
                        self.workflow_id
                    ),
                    name=self.name,
                    success=False,
                    steps=results,
                    error=(
                        f"Workflow stopped at "
                        f"step '{step.name}': "
                        f"{task.error}"
                    ),
                )

        return WorkflowResult(
            workflow_id=self.workflow_id,
            name=self.name,
            success=all(
                step["success"]
                or next(
                    (
                        s.continue_on_error
                        for s in self.steps
                        if s.step_id
                        == step["step_id"]
                    ),
                    False,
                )
                for step in results
            ),
            steps=results,
        )


class WorkflowManager:
    """Manages multiple workflows."""

    def __init__(self) -> None:

        self._workflows: dict[
            str,
            Workflow,
        ] = {}

    def register(
        self,
        workflow: Workflow,
        overwrite: bool = False,
    ) -> None:

        if (
            workflow.workflow_id
            in self._workflows
            and not overwrite
        ):

            raise ValueError(
                "Workflow already exists."
            )

        self._workflows[
            workflow.workflow_id
        ] = workflow

    def get(
        self,
        workflow_id: str,
    ) -> Workflow:

        try:

            return self._workflows[
                workflow_id
            ]

        except KeyError as exc:

            raise KeyError(
                f"Workflow '{workflow_id}' "
                "not found."
            ) from exc

    def remove(
        self,
        workflow_id: str,
    ) -> Workflow | None:

        return self._workflows.pop(
            workflow_id,
            None,
        )

    def list(
        self,
    ) -> list[Workflow]:

        return list(
            self._workflows.values()
        )

    async def run(
        self,
        workflow_id: str,
    ) -> WorkflowResult:

        workflow = self.get(
            workflow_id
        )

        return await workflow.run()