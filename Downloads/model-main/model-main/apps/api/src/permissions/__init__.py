"""
Permission package.

Provides reusable permission classes, role-based access control,
and FastAPI dependency helpers.
"""

from .base import BasePermission
from .constants import Permission
from .decorators import require_permission
from .dependencies import PermissionChecker
from .roles import RolePermission

__all__ = [
    "BasePermission",
    "Permission",
    "PermissionChecker",
    "RolePermission",
    "require_permission",
] 