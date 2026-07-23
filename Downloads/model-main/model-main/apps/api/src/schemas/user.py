"""
User schemas.

Pydantic request and response models for user management.
"""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    SecretStr,
)


class UserCreate(BaseModel):
    """
    Create user request.
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


class UserUpdate(BaseModel):
    """
    Update user request.
    """

    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    first_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    last_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    avatar_url: str | None = None

    phone_number: str | None = None

    timezone: str | None = None

    language: str | None = None


class UserRole(BaseModel):
    """
    User role.
    """

    model_config = ConfigDict(from_attributes=True)

    id: UUID

    name: str

    description: str | None = None


class UserResponse(BaseModel):
    """
    User response.
    """

    model_config = ConfigDict(from_attributes=True)

    id: UUID

    first_name: str

    last_name: str

    full_name: str

    email: EmailStr

    avatar_url: str | None = None

    phone_number: str | None = None

    timezone: str | None = None

    language: str | None = None

    is_active: bool

    is_verified: bool

    created_at: datetime

    updated_at: datetime

    roles: list[UserRole] = Field(
        default_factory=list,
    )


class UserProfileResponse(UserResponse):
    """
    Extended user profile.
    """

    organization_id: UUID | None = None

    last_login_at: datetime | None = None

    login_count: int = 0


class UserListResponse(BaseModel):
    """
    Paginated user list.
    """

    model_config = ConfigDict(from_attributes=True)

    total: int

    items: list[UserResponse]


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


class UserStatusUpdate(BaseModel):
    """
    Update user status.
    """

    model_config = ConfigDict(extra="forbid")

    is_active: bool


class UserSearchRequest(BaseModel):
    """
    Search users.
    """

    model_config = ConfigDict(extra="forbid")

    query: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    page: int = Field(
        default=1,
        ge=1,
    )

    page_size: int = Field(
        default=20,
        ge=1,
        le=100,
    )