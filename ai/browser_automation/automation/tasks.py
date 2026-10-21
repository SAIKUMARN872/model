from dataclasses import dataclass, field
from enum import Enum
from typing import Any
from uuid import uuid4

from ..models import BrowserAction


class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class AutomationTask:
    """A browser automation task containing ordered browser actions."""

    actions: list[BrowserAction]
    description: str = ""
    task_id: str = field(default_factory=lambda: str(uuid4()))
    status: TaskStatus = TaskStatus.PENDING
    results: list[dict[str, Any]] = field(default_factory=list)
    error: str | None = None

    def __post_init__(self) -> None:
        if not isinstance(self.actions, list):
            raise TypeError("actions must be a list.")
        if not all(isinstance(action, BrowserAction) for action in self.actions):
            raise TypeError("Every task action must be a BrowserAction.")
        if not isinstance(self.description, str):
            raise TypeError("description must be a string.")
