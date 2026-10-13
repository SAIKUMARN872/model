"""Helpers for composing and checking MCP permissions."""

from collections.abc import Iterable

from ai.mcp.permissions.roles import MCPRole, permissions_for_role


def normalize_permissions(permissions: Iterable[str]) -> frozenset[str]:
    """Validate and normalize a collection of permission names."""
    if isinstance(permissions, str):
        raise TypeError("Permissions must be an iterable, not a string.")

    try:
        values = tuple(permissions)
    except TypeError as exc:
        raise TypeError("Permissions must be iterable.") from exc

    if any(not isinstance(value, str) or not value.strip() for value in values):
        raise ValueError("Each permission must be a non-empty string.")

    return frozenset(value.strip() for value in values)


def combine_role_permissions(*roles: MCPRole | str) -> frozenset[str]:
    """Combine permissions from one or more roles."""
    combined = set()
    for role in roles:
        combined.update(permissions_for_role(role))
    return frozenset(combined)


def has_required_permissions(
    granted_permissions: Iterable[str],
    required_permissions: Iterable[str],
) -> bool:
    """Return True when all required permissions are granted."""
    granted = normalize_permissions(granted_permissions)
    required = normalize_permissions(required_permissions)
    return required.issubset(granted)
