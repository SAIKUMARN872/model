"""
Authentication Decorators

Enterprise Authentication & Authorization Decorators.
"""

from __future__ import annotations

from functools import wraps
from typing import Any, Callable

from fastapi import HTTPException, status

from auth.security import get_current_user


# ==========================================================
# Require Authentication
# ==========================================================

def require_auth(func: Callable[..., Any]) -> Callable[..., Any]:
    """
    Require authenticated user.
    """

    @wraps(func)
    async def wrapper(*args, **kwargs):

        user = kwargs.get("current_user")

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required.",
            )

        return await func(*args, **kwargs)

    return wrapper


# ==========================================================
# Require Roles
# ==========================================================

def require_roles(*roles: str):
    """
    Role Based Access Control (RBAC).
    """

    def decorator(func: Callable[..., Any]):

        @wraps(func)
        async def wrapper(*args, **kwargs):

            user = kwargs.get("current_user")

            if user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required.",
                )

            if getattr(user, "role", None) not in roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Permission denied.",
                )

            return await func(*args, **kwargs)

        return wrapper

    return decorator


# ==========================================================
# Require Permissions
# ==========================================================

def require_permissions(*permissions: str):
    """
    Permission Based Authorization.
    """

    def decorator(func: Callable[..., Any]):

        @wraps(func)
        async def wrapper(*args, **kwargs):

            user = kwargs.get("current_user")

            if user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required.",
                )

            user_permissions = getattr(user, "permissions", [])

            if not all(
                permission in user_permissions
                for permission in permissions
            ):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions.",
                )

            return await func(*args, **kwargs)

        return wrapper

    return decorator


# ==========================================================
# Optional Authentication
# ==========================================================

def optional_auth(func: Callable[..., Any]) -> Callable[..., Any]:
    """
    Continue execution even if no authenticated user exists.
    """

    @wraps(func)
    async def wrapper(*args, **kwargs):

        return await func(*args, **kwargs)

    return wrapper


# ==========================================================
# Super Admin Only
# ==========================================================

def super_admin_only(func: Callable[..., Any]) -> Callable[..., Any]:

    @wraps(func)
    async def wrapper(*args, **kwargs):

        user = kwargs.get("current_user")

        if user is None:
            raise HTTPException(
                status_code=401,
                detail="Authentication required.",
            )

        if getattr(user, "role", "") != "super_admin":
            raise HTTPException(
                status_code=403,
                detail="Super Admin access required.",
            )

        return await func(*args, **kwargs)

    return wrapper


# ==========================================================
# Admin Only
# ==========================================================

def admin_only(func: Callable[..., Any]) -> Callable[..., Any]:

    @wraps(func)
    async def wrapper(*args, **kwargs):

        user = kwargs.get("current_user")

        if user is None:
            raise HTTPException(
                status_code=401,
                detail="Authentication required.",
            )

        if getattr(user, "role", "") not in (
            "admin",
            "super_admin",
        ):
            raise HTTPException(
                status_code=403,
                detail="Admin access required.",
            )

        return await func(*args, **kwargs)

    return wrapper 