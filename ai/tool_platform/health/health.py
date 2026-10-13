"""Health status models for the ModelNow tool platform."""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Any


class HealthStatus(str, Enum):
    HEALTHY = "healthy"
    UNHEALTHY = "unhealthy"
    DISABLED = "disabled"
    NOT_FOUND = "not_found"
    UNKNOWN = "unknown"


@dataclass(frozen=True)
class ToolHealth:
    """Health information for one registered tool version."""

    name: str
    version: str | None
    status: HealthStatus
    handler_available: bool
    enabled: bool
    message: str
    execution_count: int = 0
    success_count: int = 0
    failure_count: int = 0
    last_execution_status: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "version": self.version,
            "status": self.status.value,
            "handler_available": self.handler_available,
            "enabled": self.enabled,
            "message": self.message,
            "execution_count": self.execution_count,
            "success_count": self.success_count,
            "failure_count": self.failure_count,
            "last_execution_status": self.last_execution_status,
        }


@dataclass(frozen=True)
class HealthReport:
    """Snapshot of health across registered tools."""

    status: HealthStatus
    total_tools: int
    healthy_tools: int
    unhealthy_tools: int
    disabled_tools: int
    tools: tuple[ToolHealth, ...]

    def to_dict(self) -> dict[str, Any]:
        return {
            "status": self.status.value,
            "total_tools": self.total_tools,
            "healthy_tools": self.healthy_tools,
            "unhealthy_tools": self.unhealthy_tools,
            "disabled_tools": self.disabled_tools,
            "tools": [tool.to_dict() for tool in self.tools],
        }
