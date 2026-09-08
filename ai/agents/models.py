"""
Data models for the ModelNow tool system.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Callable
from uuid import uuid4


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


@dataclass
class ToolDefinition:
    """
    Definition of a registered tool.
    """

    name: str
    description: str

    function: Callable[..., Any] | None = None

    tool_id: str = field(
        default_factory=lambda: str(uuid4())
    )

    category: str = "general"

    version: str = "1.0.0"

    parameters: dict[str, Any] = field(
        default_factory=dict
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    is_async: bool = False

    enabled: bool = True

    created_at: datetime = field(
        default_factory=_utc_now
    )

    def to_dict(
        self,
        include_function: bool = False,
    ) -> dict[str, Any]:

        data = {
            "tool_id": self.tool_id,
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "version": self.version,
            "parameters": dict(
                self.parameters
            ),
            "metadata": dict(
                self.metadata
            ),
            "is_async": self.is_async,
            "enabled": self.enabled,
            "created_at": self.created_at.isoformat(),
        }

        if include_function:
            data["function"] = self.function

        return data


@dataclass
class ToolCall:
    """
    Represents one tool invocation.
    """

    tool_name: str

    arguments: dict[str, Any] = field(
        default_factory=dict
    )

    call_id: str = field(
        default_factory=lambda: str(uuid4())
    )

    user_id: str | None = None

    agent_id: str | None = None

    session_id: str | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    created_at: datetime = field(
        default_factory=_utc_now
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "call_id": self.call_id,
            "tool_name": self.tool_name,
            "arguments": dict(
                self.arguments
            ),
            "user_id": self.user_id,
            "agent_id": self.agent_id,
            "session_id": self.session_id,
            "metadata": dict(
                self.metadata
            ),
            "created_at": self.created_at.isoformat(),
        }


@dataclass
class ToolResult:
    """
    Standard result returned after tool execution.
    """

    success: bool

    tool_name: str

    result: Any = None

    error: str | None = None

    call_id: str | None = None

    duration_ms: float = 0.0

    attempts: int = 1

    status: str = "success"

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    created_at: datetime = field(
        default_factory=_utc_now
    )

    @classmethod
    def success_result(
        cls,
        tool_name: str,
        result: Any = None,
        call_id: str | None = None,
        duration_ms: float = 0.0,
        attempts: int = 1,
        metadata: dict[str, Any] | None = None,
    ) -> "ToolResult":

        return cls(
            success=True,
            tool_name=tool_name,
            result=result,
            call_id=call_id,
            duration_ms=duration_ms,
            attempts=attempts,
            status="success",
            metadata=metadata or {},
        )

    @classmethod
    def failure_result(
        cls,
        tool_name: str,
        error: str,
        call_id: str | None = None,
        duration_ms: float = 0.0,
        attempts: int = 1,
        status: str = "failed",
        metadata: dict[str, Any] | None = None,
    ) -> "ToolResult":

        return cls(
            success=False,
            tool_name=tool_name,
            error=error,
            call_id=call_id,
            duration_ms=duration_ms,
            attempts=attempts,
            status=status,
            metadata=metadata or {},
        )

    def to_dict(self) -> dict[str, Any]:

        return {
            "success": self.success,
            "tool_name": self.tool_name,
            "result": self.result,
            "error": self.error,
            "call_id": self.call_id,
            "duration_ms": self.duration_ms,
            "attempts": self.attempts,
            "status": self.status,
            "metadata": dict(
                self.metadata
            ),
            "created_at": self.created_at.isoformat(),
        }


@dataclass
class ToolExecutionRecord:
    """
    Historical record of one tool execution.
    """

    call: ToolCall

    result: ToolResult

    started_at: datetime = field(
        default_factory=_utc_now
    )

    completed_at: datetime = field(
        default_factory=_utc_now
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "call": self.call.to_dict(),
            "result": self.result.to_dict(),
            "started_at": self.started_at.isoformat(),
            "completed_at": self.completed_at.isoformat(),
        }