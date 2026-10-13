"""Reuse ModelNow Tool Platform authorization."""

from ai.tool_platform.permissions import (
    PermissionContext,
    ToolPermissionError,
    authorize_tool,
)


def authorize_mcp_tool(required_permissions, context):
    return authorize_tool(tuple(required_permissions), context)


__all__ = ["PermissionContext", "ToolPermissionError", "authorize_mcp_tool"]
