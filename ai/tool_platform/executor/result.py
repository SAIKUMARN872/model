"""Structured results for ModelNow tool execution."""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Any


class ExecutionStatus(str, Enum):
    SUCCESS = "success"
    NOT_FOUND = "not_found"
    DISABLED = "disabled"
    VALIDATION_ERROR = "validation_error"
    PERMISSION_DENIED = "permission_denied"
    TIMEOUT = "timeout"
    ERROR = "error"


@dataclass(frozen=True)
class ToolExecutionResult:
    """Immutable outcome of a tool execution attempt."""

    tool_name: str
    success: bool
    status: ExecutionStatus
    output: Any = None
    error: str | None = None
    duration_seconds: float = 0.0
    version: str | None = None

    def __post_init__(self) -> None:
        if not isinstance(self.tool_name, str) or not self.tool_name:
            raise ValueError("tool_name must be a non-empty string.")
        if not isinstance(self.success, bool):
            raise TypeError("success must be a boolean.")
        if not isinstance(self.status, ExecutionStatus):
            raise TypeError("status must be an ExecutionStatus.")
        if self.duration_seconds < 0:
            raise ValueError("duration_seconds cannot be negative.")

    def to_dict(self) -> dict[str, Any]:
        """Return a serialization-friendly representation."""
        return {
            "tool_name": self.tool_name,
            "success": self.success,
            "status": self.status.value,
            "output": self.output,
            "error": self.error,
            "duration_seconds": self.duration_seconds,
            "version": self.version,
        }


# Concise alias for callers that prefer a shorter name.
ExecutionResult = ToolExecutionResult
