from __future__ import annotations

from typing import Any

from .models import AgentExecutionRequest


def validate_execution_request(request: AgentExecutionRequest) -> None:
    if not isinstance(request, AgentExecutionRequest):
        raise TypeError("request must be an AgentExecutionRequest")
    if not request.agent_id.strip():
        raise ValueError("request.agent_id cannot be empty")
    if request.timeout_seconds is not None and request.timeout_seconds <= 0:
        raise ValueError("timeout_seconds must be positive")


def normalize_agent_id(agent_id: str) -> str:
    if not isinstance(agent_id, str):
        raise TypeError("agent_id must be a string")
    normalized = agent_id.strip()
    if not normalized:
        raise ValueError("agent_id cannot be empty")
    return normalized


def to_plain_dict(value: Any) -> dict[str, Any]:
    if isinstance(value, dict):
        return dict(value)
    if hasattr(value, "model_dump") and callable(value.model_dump):
        result = value.model_dump()
        if isinstance(result, dict):
            return result
    if hasattr(value, "__dict__"):
        return dict(value.__dict__)
    raise TypeError("value cannot be represented as a dictionary")
