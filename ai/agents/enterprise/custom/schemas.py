from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any


class CustomStatus(StrEnum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    FAILED = "failed"
    AWAITING_APPROVAL = "awaiting_approval"


@dataclass(frozen=True)
class WorkflowDefinition:
    name: str
    steps: tuple[str, ...]
    requires_approval: bool = False

    def __post_init__(self):
        if not isinstance(self.name, str) or not self.name.strip():
            raise ValueError("Workflow name is required")
        if not self.steps:
            raise ValueError("Workflow must contain at least one step")
        if any(not isinstance(step, str) or not step.strip()
               for step in self.steps):
            raise ValueError("Workflow steps must be non-empty strings")
        if len(set(self.steps)) != len(self.steps):
            raise ValueError("Workflow steps must be unique")


@dataclass
class CustomCase:
    case_id: str
    workflow_name: str
    title: str
    data: dict[str, Any] = field(default_factory=dict)
    status: CustomStatus = CustomStatus.ACTIVE
    completed_steps: list[str] = field(default_factory=list)
    pending_approval: bool = False
    history: list[dict[str, Any]] = field(default_factory=list)


def require_text(value: Any, field_name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field_name} must be a non-empty string")
    return value.strip()


def require_mapping(value: Any, field_name: str) -> dict[str, Any]:
    if value is None:
        return {}
    if not isinstance(value, dict):
        raise ValueError(f"{field_name} must be a dictionary")
    return dict(value)
