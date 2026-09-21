"""
Role definitions and role-to-permission mappings.
"""

from __future__ import annotations

from enum import StrEnum

from .permissions import Permission


class Role(StrEnum):
    """
    Application roles.
    """

    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    MANAGER = "manager"
    DEVELOPER = "developer"
    ANALYST = "analyst"
    SUPPORT = "support"
    USER = "user"
    GUEST = "guest"


ROLE_PERMISSIONS: dict[Role, set[Permission]] = {
    Role.SUPER_ADMIN: {
        *list(Permission),
    },
    Role.ADMIN: {
        Permission.ADMIN_ACCESS,
        Permission.SYSTEM_CONFIG,
        Permission.SYSTEM_METRICS,
        Permission.USER_CREATE,
        Permission.USER_READ,
        Permission.USER_UPDATE,
        Permission.USER_DELETE,
        Permission.ROLE_CREATE,
        Permission.ROLE_READ,
        Permission.ROLE_UPDATE,
        Permission.ROLE_DELETE,
        Permission.AI_CHAT,
        Permission.AI_EMBED,
        Permission.AI_ADMIN,
        Permission.STORAGE_UPLOAD,
        Permission.STORAGE_DOWNLOAD,
        Permission.STORAGE_DELETE,
    },
    Role.MANAGER: {
        Permission.USER_READ,
        Permission.USER_UPDATE,
        Permission.ROLE_READ,
        Permission.AI_CHAT,
        Permission.AI_EMBED,
        Permission.STORAGE_UPLOAD,
        Permission.STORAGE_DOWNLOAD,
    },
    Role.DEVELOPER: {
        Permission.USER_READ,
        Permission.AI_CHAT,
        Permission.AI_EMBED,
        Permission.STORAGE_UPLOAD,
        Permission.STORAGE_DOWNLOAD,
    },
    Role.ANALYST: {
        Permission.USER_READ,
        Permission.AI_CHAT,
    },
    Role.SUPPORT: {
        Permission.USER_READ,
        Permission.USER_UPDATE,
    },
    Role.USER: {
        Permission.AI_CHAT,
        Permission.STORAGE_UPLOAD,
        Permission.STORAGE_DOWNLOAD,
    },
    Role.GUEST: set(),
}


def get_permissions(role: Role | str) -> set[Permission]:
    """
    Return all permissions assigned to a role.
    """

    role = Role(role)

    return ROLE_PERMISSIONS.get(role, set())


def has_role(role: Role | str, required: Role | str) -> bool:
    """
    Check if the role matches the required role.
    """

    return Role(role) == Role(required)


def role_has_permission(
    role: Role | str,
    permission: Permission | str,
) -> bool:
    """
    Check whether a role contains a permission.
    """

    permission = Permission(permission)

    return permission in ROLE_PERMISSIONS.get(Role(role), set()) 