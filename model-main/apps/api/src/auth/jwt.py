"""
JWT Utilities

Responsibilities
----------------
- Create Access Token
- Create Refresh Token
- Decode JWT
- Verify JWT
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt

from config.settings import settings
from config.logging import log


class JWTManager:
    """
    Enterprise JWT Manager.
    """

    def __init__(self) -> None:
        self.secret = settings.JWT_SECRET_KEY
        self.algorithm = settings.JWT_ALGORITHM
        self.access_expire = settings.ACCESS_TOKEN_EXPIRE_MINUTES
        self.refresh_expire = settings.REFRESH_TOKEN_EXPIRE_DAYS

    # ==========================================================
    # Create Access Token
    # ==========================================================

    def create_access_token(
        self,
        subject: str,
        claims: dict[str, Any] | None = None,
    ) -> str:

        payload = claims.copy() if claims else {}

        expire = datetime.now(timezone.utc) + timedelta(
            minutes=self.access_expire
        )

        payload.update(
            {
                "sub": subject,
                "type": "access",
                "exp": expire,
                "iat": datetime.now(timezone.utc),
            }
        )

        return jwt.encode(
            payload,
            self.secret,
            algorithm=self.algorithm,
        )

    # ==========================================================
    # Create Refresh Token
    # ==========================================================

    def create_refresh_token(
        self,
        subject: str,
    ) -> str:

        expire = datetime.now(timezone.utc) + timedelta(
            days=self.refresh_expire
        )

        payload = {
            "sub": subject,
            "type": "refresh",
            "exp": expire,
            "iat": datetime.now(timezone.utc),
        }

        return jwt.encode(
            payload,
            self.secret,
            algorithm=self.algorithm,
        )

    # ==========================================================
    # Decode Token
    # ==========================================================

    def decode(
        self,
        token: str,
    ) -> dict[str, Any]:

        try:

            return jwt.decode(
                token,
                self.secret,
                algorithms=[self.algorithm],
            )

        except JWTError as exc:

            log.exception(
                "JWT decode failed.",
                error=str(exc),
            )

            raise

    # ==========================================================
    # Verify Access Token
    # ==========================================================

    def verify_access_token(
        self,
        token: str,
    ) -> dict[str, Any]:

        payload = self.decode(token)

        if payload.get("type") != "access":
            raise ValueError("Invalid access token.")

        return payload

    # ==========================================================
    # Verify Refresh Token
    # ==========================================================

    def verify_refresh_token(
        self,
        token: str,
    ) -> dict[str, Any]:

        payload = self.decode(token)

        if payload.get("type") != "refresh":
            raise ValueError("Invalid refresh token.")

        return payload

    # ==========================================================
    # Get Subject
    # ==========================================================

    def get_subject(
        self,
        token: str,
    ) -> str:

        payload = self.decode(token)

        return payload["sub"]


jwt_manager = JWTManager() 