"""
Pydantic schemas for Organization.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class OrganizationBase(BaseModel):
    """
    Base organization schema.
    """

    name: str
    description: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    is_active: bool = True


class OrganizationCreate(OrganizationBase):
    """
    Schema for creating an organization.
    """

    pass


class OrganizationUpdate(BaseModel):
    """
    Schema for updating an organization.
    """

    name: Optional[str] = None
    description: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None


class OrganizationResponse(OrganizationBase):
    """
    Organization response schema.
    """

    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )