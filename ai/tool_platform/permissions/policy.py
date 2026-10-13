"""Authorization policy for tool invocation."""

from __future__ import annotations

from dataclasses import dataclass


class ToolPermissionError(PermissionError):
    """Raised when a caller lacks permission to invoke a tool."""


@dataclass(frozen=True)
class PermissionContext:
    user_id: str
    permissions: frozenset[str]

    def __post_init__(self) -> None:
        if not isinstance(self.user_id, str) or not self.user_id.strip():
            raise ValueError("user_id must be a non-empty string.")
        if not isinstance(self.permissions, frozenset):
            raise TypeError("permissions must be a frozenset of strings.")
        if any(not isinstance(item, str) or not item.strip() for item in self.permissions):
            raise ValueError("permissions must contain non-empty strings.")


def authorize_tool(
    required_permissions: tuple[str, ...],
    context: PermissionContext | None,
) -> None:
    if not isinstance(required_permissions, tuple) or any(
        not isinstance(item, str) or not item.strip()
        for item in required_permissions
    ):
        raise ValueError("required_permissions must be a tuple of non-empty strings.")
    if not required_permissions:
        return
    if not isinstance(context, PermissionContext):
        raise ToolPermissionError("A valid permission context is required.")
    missing = set(required_permissions) - context.permissions
    if missing:
        raise ToolPermissionError(
            "Missing required tool permission(s): " + ", ".join(sorted(missing))
        )
