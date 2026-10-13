"""Validation and graph utilities for agent planning."""

from __future__ import annotations

from collections import deque
from typing import Iterable


def validate_name(value: str, field_name: str = "name") -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field_name} must be a non-empty string.")
    return value.strip()


def validate_dependencies(
    task_ids: Iterable[str],
    dependencies: dict[str, list[str]],
) -> None:
    known = set(task_ids)
    for task_id, required in dependencies.items():
        if task_id not in known:
            raise ValueError(f"Unknown task in dependency map: {task_id}")
        for dependency in required:
            if dependency not in known:
                raise ValueError(
                    f"Task '{task_id}' depends on unknown task '{dependency}'."
                )
            if dependency == task_id:
                raise ValueError(f"Task '{task_id}' cannot depend on itself.")


def topological_sort(
    task_ids: list[str],
    dependencies: dict[str, list[str]],
) -> list[str]:
    """Return dependency-first order or reject a cyclic graph."""
    validate_dependencies(task_ids, dependencies)

    indegree = {task_id: 0 for task_id in task_ids}
    dependents = {task_id: [] for task_id in task_ids}

    for task_id in task_ids:
        for dependency in dependencies.get(task_id, []):
            indegree[task_id] += 1
            dependents[dependency].append(task_id)

    queue = deque(task_id for task_id in task_ids if indegree[task_id] == 0)
    ordered = []

    while queue:
        current = queue.popleft()
        ordered.append(current)
        for dependent in dependents[current]:
            indegree[dependent] -= 1
            if indegree[dependent] == 0:
                queue.append(dependent)

    if len(ordered) != len(task_ids):
        raise ValueError("Task dependencies contain a cycle.")

    return ordered
