"""
Validation schemas for AI requests and responses.

The implementation uses standard Python dataclasses so the
core package does not require Pydantic.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class ChatSchema:
    """Schema for chat requests."""

    message: str

    session_id: str | None = None

    model: str | None = None

    temperature: float = 0.2

    max_tokens: int | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def validate(self) -> None:

        if not self.message.strip():

            raise ValueError(
                "message cannot be empty."
            )

        if not 0 <= self.temperature <= 2:

            raise ValueError(
                "temperature must be between 0 and 2."
            )

        if (
            self.max_tokens is not None
            and self.max_tokens <= 0
        ):

            raise ValueError(
                "max_tokens must be positive."
            )


@dataclass
class AgentRequestSchema:
    """Schema for agent execution."""

    goal: str

    session_id: str | None = None

    agent_id: str | None = None

    timeout: float | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def validate(self) -> None:

        if not self.goal.strip():

            raise ValueError(
                "goal cannot be empty."
            )

        if (
            self.timeout is not None
            and self.timeout <= 0
        ):

            raise ValueError(
                "timeout must be positive."
            )


@dataclass
class ToolRequestSchema:
    """Schema for tool execution."""

    tool_name: str

    arguments: dict[str, Any] = field(
        default_factory=dict
    )

    session_id: str | None = None

    def validate(self) -> None:

        if not self.tool_name.strip():

            raise ValueError(
                "tool_name cannot be empty."
            )


@dataclass
class ExecutionSchema:
    """Schema for generic execution."""

    task_id: str

    timeout: float | None = None

    retries: int = 0

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def validate(self) -> None:

        if not self.task_id.strip():

            raise ValueError(
                "task_id cannot be empty."
            )

        if (
            self.timeout is not None
            and self.timeout <= 0
        ):

            raise ValueError(
                "timeout must be positive."
            )

        if self.retries < 0:

            raise ValueError(
                "retries cannot be negative."
            )


@dataclass
class HealthSchema:
    """Health information."""

    status: str

    version: str

    components: dict[str, str] = field(
        default_factory=dict
    )

    details: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(
        self,
    ) -> dict[str, Any]:

        return {
            "status": self.status,
            "version": self.version,
            "components": self.components,
            "details": self.details,
        }