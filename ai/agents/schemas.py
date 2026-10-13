from __future__ import annotations

from typing import Any

from .exceptions import AgentValidationError
from .models import AgentContext, AgentRequest, AgentResponse


def context_to_dict(context: AgentContext) -> dict[str, Any]:
    """Convert an execution context into a JSON-friendly dictionary."""
    if not isinstance(context, AgentContext):
        raise AgentValidationError("context must be an AgentContext")

    return {
        "conversation_id": context.conversation_id,
        "user_id": context.user_id,
        "session_id": context.session_id,
        "metadata": dict(context.metadata),
        "memory": dict(context.memory),
        "permissions": list(context.permissions),
    }


def request_to_dict(request: AgentRequest) -> dict[str, Any]:
    """Convert an agent request into a JSON-friendly dictionary."""
    if not isinstance(request, AgentRequest):
        raise AgentValidationError("request must be an AgentRequest")

    return {
        "input": request.input,
        "context": context_to_dict(request.context),
        "task_id": request.task_id,
        "metadata": dict(request.metadata),
    }


def response_to_dict(response: AgentResponse) -> dict[str, Any]:
    """Convert an agent response into a JSON-friendly dictionary."""
    if not isinstance(response, AgentResponse):
        raise AgentValidationError("response must be an AgentResponse")

    return {
        "agent_id": response.agent_id,
        "output": response.output,
        "status": response.status.value,
        "task_id": response.task_id,
        "metadata": dict(response.metadata),
        "error": response.error,
    }


__all__ = [
    "context_to_dict",
    "request_to_dict",
    "response_to_dict",
]
