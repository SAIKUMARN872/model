"""Typed action execution contract for ModelNow."""

from dataclasses import dataclass, field
from typing import Any

from .action import ActionDomain, ActionStatus


@dataclass
class ActionRequest:
    domain: ActionDomain
    goal: str
    payload: dict[str, Any] = field(default_factory=dict)
    task_id: str = ""
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class ActionResult:
    task_id: str
    domain: ActionDomain
    status: ActionStatus
    goal: str
    data: dict[str, Any] = field(default_factory=dict)
    error: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "task_id": self.task_id,
            "domain": self.domain.value,
            "status": self.status.value,
            "goal": self.goal,
            "data": dict(self.data),
            "error": self.error,
        }
