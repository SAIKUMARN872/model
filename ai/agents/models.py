from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .constants import AgentStatus
from .exceptions import AgentValidationError


@dataclass(frozen=True)
class AgentContext:
    """Execution context supplied to an agent."""

    conversation_id: str | None = None
    user_id: str | None = None
    session_id: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    memory: dict[str, Any] = field(default_factory=dict)
    permissions: tuple[str, ...] = ()

    def __post_init__(self) -> None:
        for name in ("conversation_id", "user_id", "session_id"):
            value = getattr(self, name)
            if value is not None and (not isinstance(value, str) or not value.strip()):
                raise AgentValidationError(f"{name} must be a non-empty string or None")

        if not isinstance(self.metadata, dict):
            raise AgentValidationError("metadata must be a dictionary")
        if not isinstance(self.memory, dict):
            raise AgentValidationError("memory must be a dictionary")
        if not isinstance(self.permissions, tuple) or any(
            not isinstance(item, str) or not item.strip()
            for item in self.permissions
        ):
            raise AgentValidationError("permissions must be a tuple of non-empty strings")


@dataclass(frozen=True)
class AgentRequest:
    """Input accepted by an agent."""

    input: str
    context: AgentContext = field(default_factory=AgentContext)
    task_id: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not isinstance(self.input, str) or not self.input.strip():
            raise AgentValidationError("input must be a non-empty string")
        if not isinstance(self.context, AgentContext):
            raise AgentValidationError("context must be an AgentContext")
        if self.task_id is not None and (
            not isinstance(self.task_id, str) or not self.task_id.strip()
        ):
            raise AgentValidationError("task_id must be a non-empty string or None")
        if not isinstance(self.metadata, dict):
            raise AgentValidationError("metadata must be a dictionary")


@dataclass(frozen=True)
class AgentResponse:
    """Normalized result returned by an agent."""

    agent_id: str
    output: str
    status: AgentStatus = AgentStatus.COMPLETED
    task_id: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    error: str | None = None

    def __post_init__(self) -> None:
        if not isinstance(self.agent_id, str) or not self.agent_id.strip():
            raise AgentValidationError("agent_id must be a non-empty string")
        if not isinstance(self.output, str):
            raise AgentValidationError("output must be a string")
        if not isinstance(self.status, AgentStatus):
            raise AgentValidationError("status must be an AgentStatus")
        if self.task_id is not None and (
            not isinstance(self.task_id, str) or not self.task_id.strip()
        ):
            raise AgentValidationError("task_id must be a non-empty string or None")
        if not isinstance(self.metadata, dict):
            raise AgentValidationError("metadata must be a dictionary")
        if self.error is not None and not isinstance(self.error, str):
            raise AgentValidationError("error must be a string or None")


__all__ = ["AgentContext", "AgentRequest", "AgentResponse"]
