"""
User Roles Enumeration

Enterprise RBAC Roles
"""

from __future__ import annotations

from enum import Enum


# ==========================================================
# User Roles
# ==========================================================

class UserRole(str, Enum):
    """
    System User Roles
    """

    SUPER_ADMIN = "super_admin"

    ADMIN = "admin"

    ORGANIZATION_ADMIN = "organization_admin"

    MANAGER = "manager"

    TEAM_LEAD = "team_lead"

    DEVELOPER = "developer"

    DATA_SCIENTIST = "data_scientist"

    ML_ENGINEER = "ml_engineer"

    AI_ENGINEER = "ai_engineer"

    ANALYST = "analyst"

    SUPPORT = "support"

    AUDITOR = "auditor"

    USER = "user"

    GUEST = "guest"


# ==========================================================
# Role Level
# ==========================================================

class RoleLevel(int, Enum):
    """
    Role Hierarchy
    """

    GUEST = 1

    USER = 2

    SUPPORT = 3

    ANALYST = 4

    DEVELOPER = 5

    TEAM_LEAD = 6

    MANAGER = 7

    ORGANIZATION_ADMIN = 8

    ADMIN = 9

    SUPER_ADMIN = 10


# ==========================================================
# Role Scope
# ==========================================================

class RoleScope(str, Enum):
    """
    Permission Scope
    """

    GLOBAL = "global"

    ORGANIZATION = "organization"

    TEAM = "team"

    PROJECT = "project"

    USER = "user"


# ==========================================================
# Default Roles
# ==========================================================

DEFAULT_ROLES = (
    UserRole.GUEST,
    UserRole.USER,
) 