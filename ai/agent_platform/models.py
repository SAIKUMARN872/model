from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from .constants import AgentState, ExecutionStatus


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


@dataclass(slots=True)
class AgentMetadata:
    agent_id: str
    name: str
    description: str = ""
    capabilities: tuple[str, ...] = ()
    version: str = "1.0.0"
    enabled: bool = True
    tags: tuple[str, ...] = ()
    extra: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        self.agent_id = self.agent_id.strip()
        self.name = self.name.strip()
        self.capabilities = tuple(
            item.strip() for item in self.capabilities if item.strip()
        )
        self.tags = tuple(item.strip() for item in self.tags if item.strip())

        if not self.agent_id:
            raise ValueError("agent_id cannot be empty")
        if not self.name:
            raise ValueError("name cannot be empty")
        if not self.version.strip():
            raise ValueError("version cannot be empty")


@dataclass(slots=True)
class AgentExecutionRequest:
    agent_id: str
    input: Any
    request_id: str = field(default_factory=lambda: str(uuid4()))
    context: dict[str, Any] = field(default_factory=dict)
    timeout_seconds: float | None = None

    def __post_init__(self) -> None:
        self.agent_id = self.agent_id.strip()
        if not self.agent_id:
            raise ValueError("agent_id cannot be empty")
        if self.timeout_seconds is not None and self.timeout_seconds <= 0:
            raise ValueError("timeout_seconds must be positive")


@dataclass(slots=True)
class AgentExecutionResult:
    request_id: str
    agent_id: str
    status: ExecutionStatus
    output: Any = None
    error: str | None = None
    started_at: datetime = field(default_factory=utc_now)
    completed_at: datetime = field(default_factory=utc_now)
    metadata: dict[str, Any] = field(default_factory=dict)

    @property
    def duration_seconds(self) -> float:
        return max(
            0.0,
            (self.completed_at - self.started_at).total_seconds(),
        )


@dataclass(slots=True)
class AgentRuntimeInfo:
    agent_id: str
    state: AgentState = AgentState.CREATED
    executions: int = 0
    failures: int = 0
    last_error: str | None = None
    updated_at: datetime = field(default_factory=utc_now)
