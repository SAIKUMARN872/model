"""Dependency-aware sequential plan execution."""

from __future__ import annotations

from typing import Any, Callable

from .tasks import PlanTask, TaskPlan, TaskStatus
from .utils import topological_sort


class WorkflowError(RuntimeError):
    pass


class WorkflowExecutor:
    """Executes tasks in dependency order using an injected callable.

    The callable receives a PlanTask and returns its result.
    """

    def __init__(self, task_executor: Callable[[PlanTask], Any]) -> None:
        if not callable(task_executor):
            raise ValueError("task_executor must be callable.")
        self.task_executor = task_executor

    def run(self, plan: TaskPlan) -> TaskPlan:
        ids = [task.task_id for task in plan.tasks]
        by_id = {task.task_id: task for task in plan.tasks}
        dependencies = {
            task.task_id: list(task.dependencies) for task in plan.tasks
        }
        order = topological_sort(ids, dependencies)

        for task_id in order:
            task = by_id[task_id]
            if task.status == TaskStatus.COMPLETED:
                continue

            failed_dependencies = [
                dep for dep in task.dependencies
                if by_id[dep].status in (TaskStatus.FAILED, TaskStatus.BLOCKED)
            ]
            incomplete_dependencies = [
                dep for dep in task.dependencies
                if by_id[dep].status != TaskStatus.COMPLETED
            ]

            if failed_dependencies or incomplete_dependencies:
                task.status = TaskStatus.BLOCKED
                task.error = (
                    "Dependency did not complete: "
                    + ", ".join(failed_dependencies or incomplete_dependencies)
                )
                continue

            task.status = TaskStatus.RUNNING
            task.error = None
            try:
                task.result = self.task_executor(task)
                task.status = TaskStatus.COMPLETED
            except Exception as exc:
                task.status = TaskStatus.FAILED
                task.error = f"{type(exc).__name__}: {exc}"

        return plan
