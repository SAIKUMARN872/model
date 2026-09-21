"""
Authorization policy.

Provides reusable authorization helpers for role-based and
permission-based access control.
"""

from __future__ import annotations

from collections.abc import Iterable
from typing import Any

from fastapi import HTTPException, status

from app.permissions.permissions import Permission
from app.permissions.roles import Role


class AuthorizationPolicy:
    """
    Authorization policy.

    Validates whether a user has the required role(s)
    and/or permission(s).
    """

    def __init__(
        self,
        *,
        roles: Iterable[Role | str] | None = None,
        permissions: Iterable[Permission | str] | None = None,
        require_all_permissions: bool = True,
    ) -> None:
        self.roles = (
            {Role(role) for role in roles}
            if roles
            else set()
        )

        self.permissions = (
            {Permission(permission) for permission in permissions}
            if permissions
            else set()
        )

        self.require_all_permissions = require_all_permissions

    def authorize(self, user: Any) -> bool:
        """
        Authorize the current user.
        """

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required.",
            )

        self._check_roles(user)
        self._check_permissions(user)

        return True

    def _check_roles(self, user: Any) -> None:
        """
        Validate user role.
        """

        if not self.roles:
            return

        user_role = getattr(user, "role", None)

        if user_role is None or Role(user_role) not in self.roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied.",
            )

    def _check_permissions(self, user: Any) -> None:
        """
        Validate user permissions.
        """

        if not self.permissions:
            return

        user_permissions = {
            Permission(permission)
            for permission in getattr(user, "permissions", [])
        }

        if self.require_all_permissions:
            authorized = self.permissions.issubset(user_permissions)
        else:
            authorized = not self.permissions.isdisjoint(user_permissions)

        if not authorized:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions.",
            )


def authorize_roles(*roles: Role) -> AuthorizationPolicy:
    """
    Require one of the specified roles.
    """

    return AuthorizationPolicy(
        roles=roles,
    )


def authorize_permissions(
    *permissions: Permission,
) -> AuthorizationPolicy:
    """
    Require all specified permissions.
    """

    return AuthorizationPolicy(
        permissions=permissions,
        require_all_permissions=True,
    )


def authorize_any_permission(
    *permissions: Permission,
) -> AuthorizationPolicy:
    """
    Require at least one specified permission.
    """

    return AuthorizationPolicy(
        permissions=permissions,
        require_all_permissions=False,
    ) 