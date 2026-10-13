from __future__ import annotations

from enum import StrEnum


class AgentStatus(StrEnum):
    CREATED = "created"
    READY = "ready"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


__all__ = ["AgentStatus"]
