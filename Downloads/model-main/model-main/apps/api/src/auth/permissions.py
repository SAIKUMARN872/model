"""
Permission Management

Enterprise RBAC Permission System
"""

from __future__ import annotations

from enum import Enum
from typing import Iterable


# ==========================================================
# Permission Enum
# ==========================================================

class Permission(str, Enum):
    # Users
    USER_READ = "user:read"
    USER_CREATE = "user:create"
    USER_UPDATE = "user:update"
    USER_DELETE = "user:delete"

    # Chat
    CHAT_READ = "chat:read"
    CHAT_CREATE = "chat:create"
    CHAT_UPDATE = "chat:update"
    CHAT_DELETE = "chat:delete"

    # Models
    MODEL_READ = "model:read"
    MODEL_CREATE = "model:create"
    MODEL_UPDATE = "model:update"
    MODEL_DELETE = "model:delete"

    # Files
    FILE_READ = "file:read"
    FILE_UPLOAD = "file:upload"
    FILE_DELETE = "file:delete"

    # Organizations
    ORG_READ = "organization:read"
    ORG_CREATE = "organization:create"
    ORG_UPDATE = "organization:update"
    ORG_DELETE = "organization:delete"

    # Billing
    BILLING_READ = "billing:read"
    BILLING_UPDATE = "billing:update"

    # Admin
    ADMIN = "admin:*"

    # Super Admin
    SUPER_ADMIN = "super_admin:*"


# ==========================================================
# Permission Manager
# ==========================================================

class PermissionManager:

    @staticmethod
    def has_permission(
        user_permissions: Iterable[str],
        permission: str,
    ) -> bool:
        """
        Check whether a user has a permission.
        """

        permissions = set(user_permissions)

        if Permission.SUPER_ADMIN.value in permissions:
            return True

        if Permission.ADMIN.value in permissions:
            return True

        return permission in permissions

    @staticmethod
    def has_any_permission(
        user_permissions: Iterable[str],
        required_permissions: Iterable[str],
    ) -> bool:
        """
        User must have at least one permission.
        """

        return any(
            PermissionManager.has_permission(
                user_permissions,
                permission,
            )
            for permission in required_permissions
        )

    @staticmethod
    def has_all_permissions(
        user_permissions: Iterable[str],
        required_permissions: Iterable[str],
    ) -> bool:
        """
        User must have all permissions.
        """

        return all(
            PermissionManager.has_permission(
                user_permissions,
                permission,
            )
            for permission in required_permissions
        )

    @staticmethod
    def add_permission(
        permissions: list[str],
        permission: str,
    ) -> list[str]:

        if permission not in permissions:
            permissions.append(permission)

        return permissions

    @staticmethod
    def remove_permission(
        permissions: list[str],
        permission: str,
    ) -> list[str]:

        if permission in permissions:
            permissions.remove(permission)

        return permissions

    @staticmethod
    def list_permissions() -> list[str]:
        """
        Return all available permissions.
        """

        return [permission.value for permission in Permission]


# ==========================================================
# Singleton
# ==========================================================

permission_manager = PermissionManager() 