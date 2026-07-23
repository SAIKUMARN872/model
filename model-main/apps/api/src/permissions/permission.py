"""
Permission definitions and utilities.

Centralized permission constants used throughout the application.
"""

from __future__ import annotations

from enum import StrEnum
from typing import Iterable


class Permission(StrEnum):
    """
    Application permissions.
    """

    # User permissions
    USER_CREATE = "user:create"
    USER_READ = "user:read"
    USER_UPDATE = "user:update"
    USER_DELETE = "user:delete"

    # Role permissions
    ROLE_CREATE = "role:create"
    ROLE_READ = "role:read"
    ROLE_UPDATE = "role:update"
    ROLE_DELETE = "role:delete"

    # AI permissions
    AI_CHAT = "ai:chat"
    AI_EMBED = "ai:embed"
    AI_ADMIN = "ai:admin"

    # Storage permissions
    STORAGE_UPLOAD = "storage:upload"
    STORAGE_DOWNLOAD = "storage:download"
    STORAGE_DELETE = "storage:delete"

    # Admin permissions
    ADMIN_ACCESS = "admin:access"
    SYSTEM_CONFIG = "system:config"
    SYSTEM_METRICS = "system:metrics"


def has_permission(
    user_permissions: Iterable[str],
    permission: Permission | str,
) -> bool:
    """
    Check whether a user has a specific permission.
    """
    return str(permission) in set(user_permissions)


def has_any_permission(
    user_permissions: Iterable[str],
    permissions: Iterable[Permission | str],
) -> bool:
    """
    Check whether a user has at least one of the required permissions.
    """
    user_permission_set = set(user_permissions)

    return any(
        str(permission) in user_permission_set
        for permission in permissions
    )


def has_all_permissions(
    user_permissions: Iterable[str],
    permissions: Iterable[Permission | str],
) -> bool:
    """
    Check whether a user has all required permissions.
    """
    user_permission_set = set(user_permissions)

    return all(
        str(permission) in user_permission_set
        for permission in permissions
    ) 