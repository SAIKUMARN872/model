"""
Planning utility functions for ModelNow.
"""

from __future__ import annotations

from typing import Iterable

from .tasks import (
    PlannedTask,
    TaskStatus,
)


def validate_dependencies(
    tasks: Iterable[PlannedTask],
) -> None:
    """
    Validate that all dependencies refer to
    existing tasks and that there are no cycles.
    """

    task_list = list(tasks)

    task_ids = {
        task.task_id
        for task in task_list
    }

    for task in task_list:

        for dependency in task.dependencies:

            if dependency not in task_ids:

                raise ValueError(
                    f"Task '{task.name}' depends on "
                    f"unknown task '{dependency}'"
                )

    detect_cycles(
        task_list
    )


def detect_cycles(
    tasks: Iterable[PlannedTask],
) -> None:
    """
    Detect circular dependencies.
    """

    task_map = {
        task.task_id: task
        for task in tasks
    }

    visiting: set[str] = set()
    visited: set[str] = set()

    def visit(
        task_id: str,
    ) -> None:

        if task_id in visiting:

            raise ValueError(
                "Circular task dependency detected"
            )

        if task_id in visited:
            return

        visiting.add(
            task_id
        )

        task = task_map[task_id]

        for dependency in task.dependencies:

            visit(
                dependency
            )

        visiting.remove(
            task_id
        )

        visited.add(
            task_id
        )

    for task_id in task_map:

        visit(
            task_id
        )


def topological_sort(
    tasks: Iterable[PlannedTask],
) -> list[PlannedTask]:
    """
    Return tasks in dependency-safe execution order.
    """

    task_list = list(tasks)

    validate_dependencies(
        task_list
    )

    task_map = {
        task.task_id: task
        for task in task_list
    }

    visited: set[str] = set()

    result: list[PlannedTask] = []

    def visit(
        task_id: str,
    ) -> None:

        if task_id in visited:
            return

        task = task_map[task_id]

        for dependency in task.dependencies:

            visit(
                dependency
            )

        visited.add(
            task_id
        )

        result.append(
            task
        )

    for task in task_list:

        visit(
            task.task_id
        )

    return result


def get_ready_tasks(
    tasks: Iterable[PlannedTask],
) -> list[PlannedTask]:
    """
    Return tasks whose dependencies have completed.
    """

    task_list = list(tasks)

    task_map = {
        task.task_id: task
        for task in task_list
    }

    ready = []

    for task in task_list:

        if task.status != TaskStatus.PENDING:
            continue

        dependencies_complete = all(
            task_map[
                dependency
            ].status
            == TaskStatus.COMPLETED
            for dependency
            in task.dependencies
        )

        if dependencies_complete:
            ready.append(task)

    return ready


def has_failed_dependency(
    task: PlannedTask,
    task_map: dict[str, PlannedTask],
) -> bool:

    return any(
        task_map[
            dependency
        ].status
        in {
            TaskStatus.FAILED,
            TaskStatus.CANCELLED,
            TaskStatus.SKIPPED,
        }
        for dependency
        in task.dependencies
    )


def completed_count(
    tasks: Iterable[PlannedTask],
) -> int:

    return sum(
        task.status
        == TaskStatus.COMPLETED
        for task in tasks
    )


def failed_count(
    tasks: Iterable[PlannedTask],
) -> int:

    return sum(
        task.status
        == TaskStatus.FAILED
        for task in tasks
    )


def plan_progress(
    tasks: Iterable[PlannedTask],
) -> float:

    task_list = list(tasks)

    if not task_list:
        return 100.0

    return (
        completed_count(task_list)
        / len(task_list)
    ) * 100.0