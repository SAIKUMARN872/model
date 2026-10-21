from __future__ import annotations

from typing import Any

from .models import AgentExecutionRequest


def execution_request_from_dict(data: dict[str, Any]) -> AgentExecutionRequest:
    if not isinstance(data, dict):
        raise TypeError("execution request data must be a dictionary")

    allowed = {"agent_id", "input", "request_id", "context", "timeout_seconds"}
    unknown = set(data) - allowed
    if unknown:
        raise ValueError(f"Unknown execution request fields: {sorted(unknown)}")

    if "agent_id" not in data or "input" not in data:
        raise ValueError("agent_id and input are required")

    return AgentExecutionRequest(
        agent_id=data["agent_id"],
        input=data["input"],
        request_id=data.get("request_id") or __import__("uuid").uuid4().__str__(),
        context=data.get("context") or {},
        timeout_seconds=data.get("timeout_seconds"),
    )


def metadata_to_dict(metadata: Any) -> dict[str, Any]:
    if hasattr(metadata, "__dataclass_fields__"):
        from dataclasses import asdict
        return asdict(metadata)
    if isinstance(metadata, dict):
        return dict(metadata)
    raise TypeError("metadata must be a dataclass instance or dictionary")
