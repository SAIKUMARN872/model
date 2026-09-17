"""
Goal definitions for browser automation agents.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any

from uuid import uuid4


class GoalStatus(
    str,
    Enum,
):
    CREATED = "created"
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class Goal:
    """Represents an automation goal."""

    description: str

    goal_id: str = field(
        default_factory=lambda:
        f"goal_{uuid4().hex}"
    )

    priority: int = 0

    status: GoalStatus = (
        GoalStatus.CREATED
    )

    success_criteria: list[str] = field(
        default_factory=list
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        self.description = (
            self.description.strip()
        )

        if not self.description:

            raise ValueError(
                "Goal description cannot be empty."
            )

    def activate(self) -> None:

        if self.status in (
            GoalStatus.COMPLETED,
            GoalStatus.CANCELLED,
        ):

            raise ValueError(
                f"Cannot activate goal in "
                f"{self.status.value} state."
            )

        self.status = GoalStatus.ACTIVE

    def complete(self) -> None:

        self.status = GoalStatus.COMPLETED

    def fail(self) -> None:

        self.status = GoalStatus.FAILED

    def cancel(self) -> None:

        self.status = GoalStatus.CANCELLED

    def add_criterion(
        self,
        criterion: str,
    ) -> None:

        criterion = criterion.strip()

        if not criterion:
            raise ValueError(
                "Success criterion cannot be empty."
            )

        self.success_criteria.append(
            criterion
        )


class GoalManager:
    """Manages automation goals."""

    def __init__(self) -> None:

        self._goals: dict[
            str,
            Goal,
        ] = {}

    def create(
        self,
        description: str,
        priority: int = 0,
        success_criteria: list[str] | None = None,
        **metadata: Any,
    ) -> Goal:

        goal = Goal(
            description=description,
            priority=priority,
            success_criteria=(
                success_criteria or []
            ),
            metadata=metadata,
        )

        self._goals[
            goal.goal_id
        ] = goal

        return goal

    def get(
        self,
        goal_id: str,
    ) -> Goal | None:

        return self._goals.get(
            goal_id
        )

    def remove(
        self,
        goal_id: str,
    ) -> Goal | None:

        return self._goals.pop(
            goal_id,
            None,
        )

    def all(
        self,
    ) -> list[Goal]:

        return sorted(
            self._goals.values(),
            key=lambda goal: (
                -goal.priority,
                goal.goal_id,
            ),
        )

    def active(
        self,
    ) -> list[Goal]:

        return [
            goal
            for goal in self._goals.values()
            if goal.status
            == GoalStatus.ACTIVE
        ]

    def clear(self) -> None:

        self._goals.clear()