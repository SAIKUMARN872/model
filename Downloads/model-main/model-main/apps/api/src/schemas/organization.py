"""
Organization schemas.

Pydantic request and response models for organization management.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class OrganizationCreate(BaseModel):
    """
    Create organization request.
    """

    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    name: str = Field(
        ...,
        min_length=2,
        max_length=150,
        description="Organization name.",
    )

    description: str | None = Field(
        default=None,
        max_length=1000,
    )

    website: str | None = None

    email: EmailStr | None = None

    phone: str | None = None


class OrganizationUpdate(BaseModel):
    """
    Update organization request.
    """

    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )

    description: str | None = Field(
        default=None,
        max_length=1000,
    )

    website: str | None = None

    email: EmailStr | None = None

    phone: str | None = None

    is_active: bool | None = None


class OrganizationMember(BaseModel):
    """
    Organization member.
    """

    model_config = ConfigDict(from_attributes=True)

    id: UUID

    full_name: str

    email: EmailStr

    role: str

    joined_at: datetime


class OrganizationResponse(BaseModel):
    """
    Organization response.
    """

    model_config = ConfigDict(from_attributes=True)

    id: UUID

    name: str

    description: str | None = None

    website: str | None = None

    email: EmailStr | None = None

    phone: str | None = None

    owner_id: UUID

    is_active: bool

    created_at: datetime

    updated_at: datetime

    member_count: int = 0


class OrganizationDetailResponse(OrganizationResponse):
    """
    Detailed organization response.
    """

    members: list[OrganizationMember] = Field(
        default_factory=list,
    )

    metadata: dict[str, Any] = Field(
        default_factory=dict,
    )


class OrganizationInviteRequest(BaseModel):
    """
    Invite a member.
    """

    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    email: EmailStr

    role: str = Field(
        ...,
        min_length=2,
        max_length=50,
    )


class OrganizationInviteResponse(BaseModel):
    """
    Invitation response.
    """

    model_config = ConfigDict(from_attributes=True)

    invitation_id: UUID

    email: EmailStr

    role: str

    expires_at: datetime

    status: str


class OrganizationListResponse(BaseModel):
    """
    Paginated organization list.
    """

    model_config = ConfigDict(from_attributes=True)

    total: int

    items: list[OrganizationResponse] 