from __future__ import annotations

import math

from ai.agents import AgentRequest, AgentResponse


def validate_timeout_seconds(value: object) -> float:
    """Return a valid positive, finite execution timeout."""
    if (
        isinstance(value, bool)
        or not isinstance(value, (int, float))
        or not math.isfinite(value)
        or value <= 0
    ):
        raise ValueError("timeout_seconds must be a positive finite number")

    return float(value)


def validate_max_concurrency(value: object) -> int:
    """Validate a positive integer concurrency limit."""
    if isinstance(value, bool) or not isinstance(value, int) or value < 1:
        raise ValueError("max_concurrency must be a positive integer")

    return value


def validate_agent_request(request: object) -> AgentRequest:
    """Ensure an execution input is an AgentRequest."""
    if not isinstance(request, AgentRequest):
        raise TypeError("request must be an AgentRequest")

    return request


def validate_agent_response(response: object) -> AgentResponse:
    """Ensure an execution result is an AgentResponse."""
    if not isinstance(response, AgentResponse):
        raise TypeError("response must be an AgentResponse")

    return response


__all__ = [
    "validate_timeout_seconds",
    "validate_max_concurrency",
    "validate_agent_request",
    "validate_agent_response",
]
