from __future__ import annotations

from enum import Enum

PLATFORM_NAME = "ModelNow Agent Platform"
PLATFORM_VERSION = "0.1.0"


class AgentState(str, Enum):
    CREATED = "created"
    READY = "ready"
    RUNNING = "running"
    STOPPED = "stopped"
    FAILED = "failed"


class ExecutionStatus(str, Enum):
    SUCCESS = "success"
    ERROR = "error"
