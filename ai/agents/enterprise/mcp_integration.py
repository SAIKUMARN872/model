"""Expose existing enterprise agents through the ModelNow MCP Tool Platform."""

from __future__ import annotations

import re
from uuid import uuid4
from typing import Any

from ai.agents.models import AgentContext, AgentRequest
from ai.mcp.engine import MCPEngine
from ai.tool_platform.permissions import PermissionContext, ToolPermissionError
from ai.tool_platform.registry import ToolRegistry, ToolSpec

from .constants import EnterpriseDomain
from .integration import EnterpriseAgentPlatform, create_enterprise_platform


_ACTION_PATTERN = re.compile(r"^[a-z][a-z0-9_]{0,99}$")
TASK_SCHEMA = {
    "type": "object",
    "properties": {
        "action": {"type": "string", "minLength": 1, "maxLength": 100},
        "payload": {"type": "object"},
        "task_id": {"type": "string", "minLength": 1, "maxLength": 200},
    },
    "required": ["action"],
    "additionalProperties": False,
}


def register_enterprise_mcp_tools(
    registry: ToolRegistry,
    *,
    permission_context: PermissionContext,
    platform: EnterpriseAgentPlatform | None = None,
) -> tuple[ToolSpec, ...]:
    """Register one enterprise tool per domain using trusted caller identity.

    The caller's identity and permissions come from application configuration,
    never from untrusted MCP tool arguments.
    """
    if not isinstance(registry, ToolRegistry):
        raise TypeError("registry must be a ToolRegistry.")
    if not isinstance(permission_context, PermissionContext):
        raise TypeError("A trusted PermissionContext is required.")
    if platform is not None and not isinstance(platform, EnterpriseAgentPlatform):
        raise TypeError("platform must be an EnterpriseAgentPlatform.")

    enterprise_platform = platform or create_enterprise_platform()
    registered: list[ToolSpec] = []

    for domain in EnterpriseDomain:
        tool_name = f"enterprise_{domain.value}_execute"

        def make_handler(selected_domain: EnterpriseDomain):
            async def execute_enterprise_task(
                action: str,
                payload: dict[str, Any] | None = None,
                task_id: str | None = None,
            ) -> dict[str, Any]:
                if not isinstance(action, str) or not _ACTION_PATTERN.fullmatch(action):
                    raise ValueError(
                        "action must be a lowercase action identifier "
                        "containing only letters, digits, and underscores."
                    )
                if payload is None:
                    payload = {}
                if not isinstance(payload, dict):
                    raise TypeError("payload must be an object.")
                if task_id is not None and (
                    not isinstance(task_id, str)
                    or not task_id.strip()
                    or len(task_id) > 200
                ):
                    raise ValueError("task_id must be a non-empty string of at most 200 characters.")

                required = f"enterprise:{selected_domain.value}:{action}"
                wildcard = f"enterprise:{selected_domain.value}:*"

                # Check the precise action permission before invoking the platform.
                # The router repeats this check using the same trusted context.
                if (
                    required not in permission_context.permissions
                    and wildcard not in permission_context.permissions
                ):
                    raise ToolPermissionError(
                        f"Missing required enterprise permission '{required}'."
                    )

                resolved_task_id = task_id or f"mcp-enterprise-{uuid4().hex}"
                context = AgentContext(
                    user_id=permission_context.user_id,
                    permissions=tuple(sorted(permission_context.permissions)),
                )
                request = AgentRequest(
                    input=action,
                    task_id=resolved_task_id,
                    context=context,
                    metadata={"payload": dict(payload)},
                )

                response = await enterprise_platform.execute(
                    selected_domain,
                    request,
                )
                if not response.status.value == "completed":
                    raise RuntimeError(
                        f"Enterprise task failed: {response.error or response.status.value}"
                    )

                return {
                    "task_id": resolved_task_id,
                    "domain": selected_domain.value,
                    "action": action,
                    "status": response.status.value,
                    "output": response.output,
                    "actor_id": permission_context.user_id,
                }

            return execute_enterprise_task

        spec = ToolSpec(
            name=tool_name,
            description=(
                f"Execute an authorized {domain.value} enterprise action "
                "through ModelNow's existing enterprise router and audit log."
            ),
            handler=make_handler(domain),
            input_schema=TASK_SCHEMA,
            required_permissions=(),
            tags=("enterprise", domain.value, "mcp"),
        )
        registry.register(spec)
        registered.append(spec)

    return tuple(registered)


def create_enterprise_mcp_engine(
    *,
    permission_context: PermissionContext,
    platform: EnterpriseAgentPlatform | None = None,
) -> MCPEngine:
    """Build an MCP engine with all seven enterprise tools registered."""
    registry = ToolRegistry()
    register_enterprise_mcp_tools(
        registry,
        permission_context=permission_context,
        platform=platform,
    )
    return MCPEngine(
        registry,
        permission_context=permission_context,
    )


__all__ = [
    "register_enterprise_mcp_tools",
    "create_enterprise_mcp_engine",
]
