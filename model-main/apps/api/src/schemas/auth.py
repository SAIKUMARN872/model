"""
Authentication schemas.

Pydantic request and response models for authentication.
"""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, EmailStr, Field, SecretStr


class RegisterRequest(BaseModel):
    """
    User registration request.
    """

    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    first_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    last_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    email: EmailStr

    password: SecretStr = Field(
        ...,
        min_length=8,
        max_length=128,
    )


class LoginRequest(BaseModel):
    """
    User login request.
    """

    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    email: EmailStr

    password: SecretStr


class RefreshTokenRequest(BaseModel):
    """
    Refresh token request.
    """

    model_config = ConfigDict(extra="forbid")

    refresh_token: str = Field(
        ...,
        min_length=20,
    )


class ChangePasswordRequest(BaseModel):
    """
    Change password request.
    """

    model_config = ConfigDict(extra="forbid")

    current_password: SecretStr

    new_password: SecretStr = Field(
        ...,
        min_length=8,
        max_length=128,
    )


class ForgotPasswordRequest(BaseModel):
    """
    Forgot password request.
    """

    model_config = ConfigDict(extra="forbid")

    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """
    Reset password request.
    """

    model_config = ConfigDict(extra="forbid")

    token: str

    password: SecretStr = Field(
        ...,
        min_length=8,
        max_length=128,
    )


class VerifyEmailRequest(BaseModel):
    """
    Verify email request.
    """

    model_config = ConfigDict(extra="forbid")

    token: str


class TokenResponse(BaseModel):
    """
    JWT token response.
    """

    model_config = ConfigDict(extra="ignore")

    access_token: str

    refresh_token: str

    token_type: str = "Bearer"

    expires_in: int


class AuthResponse(BaseModel):
    """
    Authentication response.
    """

    model_config = ConfigDict(extra="ignore")

    user_id: str

    email: EmailStr

    first_name: str

    last_name: str

    access_token: str

    refresh_token: str

    token_type: str = "Bearer"

    expires_in: int


class LogoutResponse(BaseModel):
    """
    Logout response.
    """

    success: bool = True

    message: str = "Logged out successfully."