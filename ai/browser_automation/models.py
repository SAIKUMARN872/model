from dataclasses import dataclass, field
from typing import Any
from .constants import BrowserActionType, BrowserTaskStatus


@dataclass(frozen=True)
class BrowserAction:
    action_type: BrowserActionType
    selector: str | None = None
    value: str | None = None
    url: str | None = None
    description: str = ""
    requires_approval: bool = False


@dataclass
class BrowserTask:
    goal: str
    start_url: str | None = None
    actions: list[BrowserAction] = field(default_factory=list)
    task_id: str = ""
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class BrowserExecutionResult:
    task_id: str
    status: BrowserTaskStatus
    goal: str
    completed_actions: int = 0
    results: list[dict[str, Any]] = field(default_factory=list)
    error: str | None = None
    verification: dict[str, Any] | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "task_id": self.task_id,
            "status": self.status.value,
            "goal": self.goal,
            "completed_actions": self.completed_actions,
            "results": self.results,
            "error": self.error,
            "verification": self.verification,
        }
