"""Named permission roles for ModelNow MCP access."""

from enum import Enum


class MCPRole(str, Enum):
    READER = "reader"
    OPERATOR = "operator"
    ADMIN = "admin"


ROLE_PERMISSIONS = {
    MCPRole.READER: frozenset({
        "mcp:read",
        "tools:list",
        "resources:read",
    }),
    MCPRole.OPERATOR: frozenset({
        "mcp:read",
        "tools:list",
        "tools:execute",
        "resources:read",
    }),
    MCPRole.ADMIN: frozenset({
        "mcp:read",
        "tools:list",
        "tools:execute",
        "resources:read",
        "resources:write",
        "mcp:admin",
    }),
}


def permissions_for_role(role: MCPRole | str) -> frozenset[str]:
    """Return an immutable permission set for a known role."""
    try:
        normalized = role if isinstance(role, MCPRole) else MCPRole(role)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"Unknown MCP role: {role!r}") from exc
    return ROLE_PERMISSIONS[normalized]


def role_allows(role: MCPRole | str, permission: str) -> bool:
    """Check whether a role contains a specific permission."""
    if not isinstance(permission, str) or not permission.strip():
        raise ValueError("Permission must be a non-empty string.")
    return permission in permissions_for_role(role)
