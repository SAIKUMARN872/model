"""
Authentication API routes.

Provides login, refresh, logout, current user, and registration endpoints.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.auth.dependencies import get_current_user
from app.responses.response import ApiResponse
from app.schemas.auth import (
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
)
from app.schemas.user import UserResponse
from app.services.auth import AuthService

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


def get_auth_service() -> AuthService:
    """
    Authentication service dependency.
    """
    return AuthService()


@router.post(
    "/register",
    response_model=ApiResponse[UserResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(
    request: RegisterRequest,
    service: AuthService = Depends(get_auth_service),
) -> ApiResponse[UserResponse]:
    """
    Register a new user.
    """

    user = await service.register(request)

    return ApiResponse.ok(
        data=user,
        message="User registered successfully.",
    )


@router.post(
    "/login",
    response_model=ApiResponse[TokenResponse],
    summary="Login",
)
async def login(
    request: LoginRequest,
    service: AuthService = Depends(get_auth_service),
) -> ApiResponse[TokenResponse]:
    """
    Authenticate user and issue access tokens.
    """

    tokens = await service.login(request)

    if tokens is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    return ApiResponse.ok(
        data=tokens,
        message="Login successful.",
    )


@router.post(
    "/refresh",
    response_model=ApiResponse[TokenResponse],
    summary="Refresh access token",
)
async def refresh_token(
    request: RefreshTokenRequest,
    service: AuthService = Depends(get_auth_service),
) -> ApiResponse[TokenResponse]:
    """
    Refresh JWT access token.
    """

    tokens = await service.refresh_token(request.refresh_token)

    return ApiResponse.ok(
        data=tokens,
        message="Token refreshed successfully.",
    )


@router.post(
    "/logout",
    response_model=ApiResponse[dict],
    summary="Logout",
)
async def logout(
    response: Response,
    current_user=Depends(get_current_user),
    service: AuthService = Depends(get_auth_service),
) -> ApiResponse[dict]:
    """
    Logout current user.
    """

    await service.logout(current_user)

    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")

    return ApiResponse.ok(
        data={},
        message="Logout successful.",
    )


@router.get(
    "/me",
    response_model=ApiResponse[UserResponse],
    summary="Current authenticated user",
)
async def me(
    current_user=Depends(get_current_user),
) -> ApiResponse[UserResponse]:
    """
    Return current authenticated user.
    """

    return ApiResponse.ok(
        data=current_user,
        message="User profile retrieved successfully.",
    )


@router.post(
    "/verify-email",
    response_model=ApiResponse[dict],
    summary="Verify email",
)
async def verify_email(
    token: str,
    service: AuthService = Depends(get_auth_service),
) -> ApiResponse[dict]:
    """
    Verify user email address.
    """

    await service.verify_email(token)

    return ApiResponse.ok(
        data={},
        message="Email verified successfully.",
    )


@router.post(
    "/forgot-password",
    response_model=ApiResponse[dict],
    summary="Forgot password",
)
async def forgot_password(
    email: str,
    service: AuthService = Depends(get_auth_service),
) -> ApiResponse[dict]:
    """
    Send password reset email.
    """

    await service.forgot_password(email)

    return ApiResponse.ok(
        data={},
        message="Password reset email sent.",
    )


@router.post(
    "/reset-password",
    response_model=ApiResponse[dict],
    summary="Reset password",
)
async def reset_password(
    token: str,
    new_password: str,
    service: AuthService = Depends(get_auth_service),
) -> ApiResponse[dict]:
    """
    Reset user password.
    """

    await service.reset_password(
        token=token,
        new_password=new_password,
    )

    return ApiResponse.ok(
        data={},
        message="Password reset successful.",
    ) 