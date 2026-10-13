"""Planned task and action data models."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ai.browser_automation.models import BrowserAction


@dataclass(frozen=True)
class PlannedTask:
    goal: str
    actions: tuple[BrowserAction, ...]
    plan_id: str
    requires_approval: bool = False
    notes: tuple[str, ...] = ()
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not isinstance(self.goal, str) or not self.goal.strip():
            raise ValueError("Planned task goal must be non-empty.")
        if not isinstance(self.plan_id, str) or not self.plan_id.strip():
            raise ValueError("Plan ID must be non-empty.")
        if not isinstance(self.actions, tuple):
            raise TypeError("actions must be a tuple.")
        if any(not isinstance(action, BrowserAction) for action in self.actions):
            raise TypeError("Every planned action must be a BrowserAction.")
