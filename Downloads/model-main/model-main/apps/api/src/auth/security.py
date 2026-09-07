"""
Security Utilities

Responsibilities
----------------
- Password Hashing
- Password Verification
- API Key Validation
- JWT Authentication
- Current User Authentication
"""

from __future__ import annotations

import secrets
from typing import Any

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import (
    APIKeyHeader,
    HTTPAuthorizationCredentials,
    HTTPBearer,
)
from passlib.context import CryptContext

from auth.jwt import jwt_manager
from config.settings import settings

# ==========================================================
# Password Hashing
# ==========================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

# ==========================================================
# Security Schemes
# ==========================================================

bearer_scheme = HTTPBearer(
    auto_error=False,
)

api_key_scheme = APIKeyHeader(
    name="X-API-Key",
    auto_error=False,
)


class SecurityManager:
    """
    Enterprise Security Manager.
    """

    # ------------------------------------------------------
    # Password Hashing
    # ------------------------------------------------------

    def hash_password(
        self,
        password: str,
    ) -> str:

        return pwd_context.hash(password)

    # ------------------------------------------------------
    # Verify Password
    # ------------------------------------------------------

    def verify_password(
        self,
        plain_password: str,
        hashed_password: str,
    ) -> bool:

        return pwd_context.verify(
            plain_password,
            hashed_password,
        )

    # ------------------------------------------------------
    # Generate API Key
    # ------------------------------------------------------

    def generate_api_key(self) -> str:

        return secrets.token_urlsafe(32)

    # ------------------------------------------------------
    # Verify API Key
    # ------------------------------------------------------

    def verify_api_key(
        self,
        api_key: str,
    ) -> bool:

        return secrets.compare_digest(
            api_key,
            settings.API_KEY,
        )

    # ------------------------------------------------------
    # Decode JWT
    # ------------------------------------------------------

    def decode_token(
        self,
        token: str,
    ) -> dict[str, Any]:

        return jwt_manager.verify_access_token(token)


security_manager = SecurityManager()


# ==========================================================
# Dependencies
# ==========================================================

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(
        bearer_scheme,
    ),
):

    if credentials is None:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    try:

        payload = security_manager.decode_token(
            credentials.credentials,
        )

        return payload

    except Exception:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token.",
        )


async def get_api_key(
    api_key: str = Security(api_key_scheme),
):

    if api_key is None:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API Key missing.",
        )

    if not security_manager.verify_api_key(
        api_key,
    ):

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key.",
        )

    return api_key


async def get_current_active_user(
    current_user: dict = Depends(
        get_current_user,
    ),
):

    if current_user.get("disabled", False):

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account disabled.",
        )

    return current_user


async def get_current_admin(
    current_user: dict = Depends(
        get_current_active_user,
    ),
):

    role = current_user.get("role")

    if role not in (
        "admin",
        "super_admin",
    ):

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )

    return current_user 