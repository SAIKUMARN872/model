"""
Utilities for goal/task planning.
"""

from __future__ import annotations

import re
from typing import Any


def clean_goal(
    goal: str,
) -> str:

    if not isinstance(
        goal,
        str,
    ):

        raise TypeError(
            "Goal must be a string."
        )

    goal = re.sub(
        r"\s+",
        " ",
        goal,
    ).strip()

    if not goal:

        raise ValueError(
            "Goal cannot be empty."
        )

    return goal


def normalize_task_name(
    name: str,
) -> str:

    name = re.sub(
        r"\s+",
        " ",
        str(name),
    ).strip()

    if not name:

        raise ValueError(
            "Task name cannot be empty."
        )

    return name


def estimate_task_count(
    tasks: list[Any],
) -> int:

    return len(tasks)


def dependency_levels(
    tasks: list[Any],
) -> dict[str, int]:
    """
    Calculate dependency depth for tasks.
    """

    task_map = {
        task.task_id: task
        for task in tasks
    }

    cache: dict[str, int] = {}

    def level(
        task_id: str,
        visiting: set[str] | None = None,
    ) -> int:

        visiting = (
            visiting
            or set()
        )

        if task_id in cache:
            return cache[task_id]

        if task_id in visiting:

            raise ValueError(
                "Circular dependency detected."
            )

        visiting.add(
            task_id
        )

        task = task_map[task_id]

        if not task.dependencies:

            result = 0

        else:

            result = 1 + max(
                level(
                    dependency,
                    visiting.copy(),
                )
                for dependency
                in task.dependencies
            )

        cache[task_id] = result

        return result

    return {
        task.task_id: level(
            task.task_id
        )
        for task in tasks
    }


def summarize_plan(
    tasks: list[Any],
) -> dict[str, Any]:

    levels = dependency_levels(
        tasks
    )

    return {
        "total_tasks": len(tasks),
        "dependency_levels": levels,
        "max_depth": (
            max(
                levels.values()
            )
            if levels
            else 0
        ),
    }