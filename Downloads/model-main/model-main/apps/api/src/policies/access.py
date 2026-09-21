"""
Access policy.

Provides role- and permission-based authorization policies.
"""

from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass
from typing import Any

from fastapi import HTTPException, status

from app.permissions.permissions import Permission
from app.permissions.roles import Role


@dataclass(slots=True, frozen=True)
class AccessPolicy:
    """
    Access control policy.

    Example:
        policy = AccessPolicy(
            roles={Role.ADMIN},
            permissions={Permission.USER_READ},
        )

        policy.validate(current_user)
    """

    roles: set[Role] | None = None
    permissions: set[Permission] | None = None
    require_all_permissions: bool = True

    def validate(self, user: Any) -> bool:
        """
        Validate that the user satisfies this policy.
        """

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required.",
            )

        self._validate_roles(user)
        self._validate_permissions(user)

        return True

    def _validate_roles(self, user: Any) -> None:
        """
        Validate allowed roles.
        """

        if not self.roles:
            return

        user_role = getattr(user, "role", None)

        if user_role is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User role is missing.",
            )

        if Role(user_role) not in self.roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied.",
            )

    def _validate_permissions(self, user: Any) -> None:
        """
        Validate required permissions.
        """

        if not self.permissions:
            return

        user_permissions = {
            Permission(permission)
            for permission in getattr(user, "permissions", [])
        }

        if self.require_all_permissions:
            allowed = self.permissions.issubset(user_permissions)
        else:
            allowed = not self.permissions.isdisjoint(user_permissions)

        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions.",
            )


def require_role(*roles: Role) -> AccessPolicy:
    """
    Require one of the supplied roles.
    """

    return AccessPolicy(
        roles=set(roles),
    )


def require_permission(*permissions: Permission) -> AccessPolicy:
    """
    Require all supplied permissions.
    """

    return AccessPolicy(
        permissions=set(permissions),
        require_all_permissions=True,
    )


def require_any_permission(*permissions: Permission) -> AccessPolicy:
    """
    Require at least one supplied permission.
    """

    return AccessPolicy(
        permissions=set(permissions),
        require_all_permissions=False,
    ) 