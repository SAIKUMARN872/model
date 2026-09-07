"""
Role Management

Enterprise Role-Based Access Control (RBAC)
"""

from __future__ import annotations

from enum import Enum

from auth.permissions import Permission


# ==========================================================
# Roles
# ==========================================================

class Role(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    MANAGER = "manager"
    DEVELOPER = "developer"
    ANALYST = "analyst"
    USER = "user"
    GUEST = "guest"


# ==========================================================
# Role Permissions
# ==========================================================

ROLE_PERMISSIONS = {

    Role.SUPER_ADMIN: [
        permission.value
        for permission in Permission
    ],

    Role.ADMIN: [

        Permission.USER_READ.value,
        Permission.USER_CREATE.value,
        Permission.USER_UPDATE.value,
        Permission.USER_DELETE.value,

        Permission.CHAT_READ.value,
        Permission.CHAT_CREATE.value,
        Permission.CHAT_UPDATE.value,
        Permission.CHAT_DELETE.value,

        Permission.MODEL_READ.value,
        Permission.MODEL_CREATE.value,
        Permission.MODEL_UPDATE.value,
        Permission.MODEL_DELETE.value,

        Permission.FILE_READ.value,
        Permission.FILE_UPLOAD.value,
        Permission.FILE_DELETE.value,

        Permission.ORG_READ.value,
        Permission.ORG_CREATE.value,
        Permission.ORG_UPDATE.value,
        Permission.ORG_DELETE.value,

        Permission.BILLING_READ.value,
        Permission.BILLING_UPDATE.value,
    ],

    Role.MANAGER: [

        Permission.USER_READ.value,

        Permission.CHAT_READ.value,
        Permission.CHAT_CREATE.value,

        Permission.MODEL_READ.value,

        Permission.FILE_READ.value,
        Permission.FILE_UPLOAD.value,

        Permission.ORG_READ.value,
    ],

    Role.DEVELOPER: [

        Permission.CHAT_READ.value,
        Permission.CHAT_CREATE.value,
        Permission.CHAT_UPDATE.value,

        Permission.MODEL_READ.value,

        Permission.FILE_UPLOAD.value,
        Permission.FILE_READ.value,
    ],

    Role.ANALYST: [

        Permission.CHAT_READ.value,

        Permission.MODEL_READ.value,

        Permission.FILE_READ.value,
    ],

    Role.USER: [

        Permission.CHAT_READ.value,
        Permission.CHAT_CREATE.value,

        Permission.FILE_UPLOAD.value,
        Permission.FILE_READ.value,
    ],

    Role.GUEST: [

        Permission.CHAT_READ.value,
    ],
}


# ==========================================================
# Role Manager
# ==========================================================

class RoleManager:

    @staticmethod
    def permissions(role: str) -> list[str]:
        """
        Get permissions for a role.
        """

        try:
            return ROLE_PERMISSIONS[
                Role(role)
            ]

        except Exception:
            return []

    @staticmethod
    def has_role(
        user_role: str,
        required_role: str,
    ) -> bool:

        return user_role == required_role

    @staticmethod
    def is_admin(
        user_role: str,
    ) -> bool:

        return user_role in (
            Role.ADMIN.value,
            Role.SUPER_ADMIN.value,
        )

    @staticmethod
    def is_super_admin(
        user_role: str,
    ) -> bool:

        return user_role == Role.SUPER_ADMIN.value

    @staticmethod
    def list_roles() -> list[str]:

        return [
            role.value
            for role in Role
        ]

    @staticmethod
    def exists(
        role: str,
    ) -> bool:

        return role in Role._value2member_map_


# ==========================================================
# Singleton
# ==========================================================

role_manager = RoleManager() 