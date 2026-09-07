"""
Authentication service.

Handles user registration, authentication, JWT token generation,
token refresh, email verification, and password management.
"""

from __future__ import annotations

from uuid import UUID

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    get_password_hash,
    verify_password,
)
from app.repositories.user import UserRepository
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
)
from app.schemas.user import UserResponse


class AuthService:
    """
    Authentication business logic.
    """

    def __init__(
        self,
        repository: UserRepository | None = None,
    ) -> None:
        self._repository = repository or UserRepository()

    async def register(
        self,
        request: RegisterRequest,
    ) -> UserResponse:
        """
        Register a new user.
        """

        existing = await self._repository.get_by_email(
            request.email,
        )

        if existing:
            raise ValueError("Email already registered.")

        user = await self._repository.create(
            first_name=request.first_name,
            last_name=request.last_name,
            email=request.email,
            password_hash=get_password_hash(
                request.password.get_secret_value(),
            ),
        )

        return UserResponse.model_validate(
            user,
            from_attributes=True,
        )

    async def login(
        self,
        request: LoginRequest,
    ) -> TokenResponse:
        """
        Authenticate user.
        """

        user = await self._repository.get_by_email(
            request.email,
        )

        if not user:
            raise ValueError("Invalid credentials.")

        valid = verify_password(
            request.password.get_secret_value(),
            user.password_hash,
        )

        if not valid:
            raise ValueError("Invalid credentials.")

        access_token = create_access_token(
            subject=str(user.id),
        )

        refresh_token = create_refresh_token(
            subject=str(user.id),
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=3600,
        )

    async def refresh_token(
        self,
        refresh_token: str,
    ) -> TokenResponse:
        """
        Generate a new access token.
        """

        payload = decode_refresh_token(
            refresh_token,
        )

        user_id = payload["sub"]

        access_token = create_access_token(
            subject=user_id,
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=3600,
        )

    async def logout(
        self,
        user: UserResponse,
    ) -> None:
        """
        Logout user.
        """

        return None

    async def verify_email(
        self,
        token: str,
    ) -> None:
        """
        Verify user email.
        """

        await self._repository.verify_email(
            token,
        )

    async def forgot_password(
        self,
        email: str,
    ) -> None:
        """
        Trigger password reset workflow.
        """

        await self._repository.create_password_reset(
            email,
        )

    async def reset_password(
        self,
        token: str,
        new_password: str,
    ) -> None:
        """
        Reset user password.
        """

        password_hash = get_password_hash(
            new_password,
        )

        await self._repository.reset_password(
            token=token,
            password_hash=password_hash,
        )

    async def get_current_user(
        self,
        user_id: UUID,
    ) -> UserResponse:
        """
        Return authenticated user.
        """

        user = await self._repository.get(
            user_id,
        )

        return UserResponse.model_validate(
            user,
            from_attributes=True,
        )