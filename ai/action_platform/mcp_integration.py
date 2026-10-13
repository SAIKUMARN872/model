"""Expose Action Platform through the existing MCP Tool Platform."""

from __future__ import annotations

import inspect
from typing import Any, Callable
from uuid import uuid4

from ai.action_platform.core.action import ActionDomain
from ai.action_platform.core.context import ActionContext
from ai.action_platform.core.models import ActionRequest
from ai.action_platform.core.schemas import validate_request
from ai.action_platform.executor import ActionExecutor
from ai.action_platform.registry import ActionRegistry
from ai.action_platform.router import action_requires_approval
from ai.mcp.engine import MCPEngine
from ai.tool_platform.permissions import PermissionContext
from ai.tool_platform.registry import ToolRegistry, ToolSpec

TOOL_NAME = "action_platform_execute"

_INPUT_SCHEMA = {
    "type": "object",
    "properties": {
        "domain": {
            "type": "string",
            "enum": [domain.value for domain in ActionDomain],
        },
        "goal": {"type": "string", "minLength": 1, "maxLength": 10000},
        "payload": {"type": "object"},
        "task_id": {"type": "string", "maxLength": 200},
    },
    "required": ["domain", "goal"],
    "additionalProperties": False,
}


def register_action_platform_tool(
    tool_registry: ToolRegistry,
    *,
    action_registry: ActionRegistry,
    permission_context: PermissionContext,
    approval_callback: Callable | None = None,
) -> ToolSpec:
    """Register the action tool using trusted identity and permissions."""
    if not isinstance(tool_registry, ToolRegistry):
        raise TypeError("tool_registry must be a ToolRegistry.")
    if not isinstance(action_registry, ActionRegistry):
        raise TypeError("action_registry must be an ActionRegistry.")
    if not isinstance(permission_context, PermissionContext):
        raise TypeError("A trusted PermissionContext is required.")
    if approval_callback is not None and not callable(approval_callback):
        raise TypeError("approval_callback must be callable.")

    executor = ActionExecutor(action_registry)

    async def execute_action(
        domain: str,
        goal: str,
        payload: dict[str, Any] | None = None,
        task_id: str = "",
    ) -> dict[str, Any]:
        if not isinstance(domain, str):
            raise TypeError("domain must be a string.")
        try:
            selected_domain = ActionDomain(domain)
        except ValueError as exc:
            raise ValueError(f"Unsupported action domain: {domain}") from exc

        if not isinstance(goal, str) or not goal.strip() or len(goal) > 10000:
            raise ValueError("goal must be non-empty and at most 10000 characters.")
        if payload is None:
            payload = {}
        if not isinstance(payload, dict):
            raise TypeError("payload must be an object.")
        if not isinstance(task_id, str) or len(task_id) > 200:
            raise ValueError("task_id must be a string of at most 200 characters.")

        resolved_id = task_id.strip() or f"mcp-action-{uuid4().hex}"
        request = ActionRequest(
            domain=selected_domain,
            goal=goal,
            payload=dict(payload),
            task_id=resolved_id,
        )
        validate_request(request)

        required = f"action:{selected_domain.value}"
        if required not in permission_context.permissions:
            from ai.action_platform.exceptions import ActionPermissionError
            raise ActionPermissionError(f"Missing required permission: {required}")

        context = ActionContext(
            user_id=permission_context.user_id,
            permissions=set(permission_context.permissions),
        )

        # Never trust approval fields supplied by the MCP caller.
        if action_requires_approval(request) and approval_callback is not None:
            approval = approval_callback(request, permission_context)
            if inspect.isawaitable(approval):
                approval = await approval
            if approval is True:
                context.approved_actions.add(resolved_id)

        result = await executor.execute(request, context)
        return result.to_dict()

    return tool_registry.register(ToolSpec(
        name=TOOL_NAME,
        description=(
            "Execute a ModelNow Action Platform request with trusted domain "
            "permissions. Consequential actions require explicit approval."
        ),
        handler=execute_action,
        version="1.0.0",
        input_schema=_INPUT_SCHEMA,
        required_permissions=(),
        tags=("action-platform", "automation", "mcp"),
    ))


def create_action_platform_mcp_engine(
    *,
    action_registry: ActionRegistry,
    permission_context: PermissionContext,
    approval_callback: Callable | None = None,
) -> MCPEngine:
    registry = ToolRegistry()
    register_action_platform_tool(
        registry,
        action_registry=action_registry,
        permission_context=permission_context,
        approval_callback=approval_callback,
    )
    return MCPEngine(registry, permission_context=permission_context)


__all__ = [
    "TOOL_NAME",
    "register_action_platform_tool",
    "create_action_platform_mcp_engine",
]
