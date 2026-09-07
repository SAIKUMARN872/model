"""
Authentication pipeline stage.

Validates the authenticated user and stores it in the pipeline context.
"""

from __future__ import annotations

from typing import Any

from fastapi import HTTPException, status


class AuthenticationStage:
    """
    Authentication stage for the request pipeline.
    """

    name = "authentication"

    async def execute(self, context: dict[str, Any]) -> dict[str, Any]:
        """
        Execute the authentication stage.

        Expected context:
            {
                "user": CurrentUser | None
            }
        """

        user = context.get("user")

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required.",
            )

        is_active = getattr(user, "is_active", True)

        if not is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive.",
            )

        context["authenticated"] = True
        context["current_user"] = user

        return context


authentication_stage = AuthenticationStage() 