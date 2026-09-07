"""
Role-Based Access Control (RBAC).

Provides reusable FastAPI dependencies for checking user
roles and permissions.
"""

from __future__ import annotations

from collections.abc import Iterable

from fastapi import Depends, HTTPException, status

from app.auth.dependencies import get_current_user
from app.permissions.permissions import Permission


class RBAC:
    """
    FastAPI dependency for enforcing permissions.
    """

    def __init__(self, *permissions: Permission | str) -> None:
        self.required_permissions = {str(p) for p in permissions}

    def __call__(self, current_user=Depends(get_current_user)):
        """
        Validate that the current user has the required permissions.
        """

        user_permissions = {
            str(permission)
            for permission in getattr(current_user, "permissions", [])
        }

        if not self.required_permissions.issubset(user_permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions.",
            )

        return current_user


class AnyPermission:
    """
    Allows access if the user has at least one permission.
    """

    def __init__(self, *permissions: Permission | str) -> None:
        self.permissions = {str(p) for p in permissions}

    def __call__(self, current_user=Depends(get_current_user)):
        user_permissions = {
            str(permission)
            for permission in getattr(current_user, "permissions", [])
        }

        if user_permissions.isdisjoint(self.permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions.",
            )

        return current_user


class RoleChecker:
    """
    Allows access only to specific roles.
    """

    def __init__(self, *roles: str) -> None:
        self.allowed_roles = set(roles)

    def __call__(self, current_user=Depends(get_current_user)):
        role = getattr(current_user, "role", None)

        if role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient role.",
            )

        return current_user


def check_permissions(
    user_permissions: Iterable[str],
    required_permissions: Iterable[Permission | str],
) -> bool:
    """
    Returns True if all required permissions are present.
    """

    user_permission_set = set(user_permissions)

    return all(
        str(permission) in user_permission_set
        for permission in required_permissions
    ) 