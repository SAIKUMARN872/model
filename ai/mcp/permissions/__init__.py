"""MCP permission policies, roles, and permission helpers."""

from .policy import PermissionContext, ToolPermissionError, authorize_mcp_tool
from .roles import MCPRole, permissions_for_role, role_allows
from .utils import (
    combine_role_permissions,
    has_required_permissions,
    normalize_permissions,
)

__all__ = [
    "PermissionContext",
    "ToolPermissionError",
    "authorize_mcp_tool",
    "MCPRole",
    "permissions_for_role",
    "role_allows",
    "combine_role_permissions",
    "has_required_permissions",
    "normalize_permissions",
]
