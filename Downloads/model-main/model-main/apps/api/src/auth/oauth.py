"""
OAuth2 Authentication

Enterprise OAuth2 Implementation
"""

from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from auth.jwt import jwt_manager

# ==========================================================
# OAuth2 Scheme
# ==========================================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=True,
)


class OAuthService:
    """
    OAuth2 Authentication Service.
    """

    # ======================================================
    # Verify Access Token
    # ======================================================

    async def verify_token(self, token: str) -> dict:

        try:

            payload = jwt_manager.verify_access_token(token)

            return payload

        except Exception:

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired access token.",
                headers={
                    "WWW-Authenticate": "Bearer",
                },
            )

    # ======================================================
    # Current User
    # ======================================================

    async def get_current_user(
        self,
        token: str = Depends(oauth2_scheme),
    ) -> dict:

        payload = await self.verify_token(token)

        return {
            "id": payload.get("sub"),
            "email": payload.get("email"),
            "role": payload.get("role", "user"),
            "permissions": payload.get("permissions", []),
            "token": token,
        }

    # ======================================================
    # Current Active User
    # ======================================================

    async def get_current_active_user(
        self,
        current_user: dict = Depends(get_current_user),
    ) -> dict:

        if current_user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not authenticated.",
            )

        return current_user


oauth_service = OAuthService()

get_current_user = oauth_service.get_current_user

get_current_active_user = oauth_service.get_current_active_user 