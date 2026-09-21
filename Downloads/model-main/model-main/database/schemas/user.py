"""
Pydantic schemas for User.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    """
    Base user schema.
    """

    first_name: str = Field(..., max_length=100)
    last_name: str = Field(..., max_length=100)
    username: str = Field(..., max_length=100)
    email: EmailStr

    is_active: bool = True
    is_verified: bool = False
    is_superuser: bool = False


class UserCreate(UserBase):
    """
    Schema for creating a user.
    """

    password: str = Field(..., min_length=8, max_length=128)


class UserUpdate(BaseModel):
    """
    Schema for updating a user.
    """

    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    username: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None

    password: Optional[str] = Field(None, min_length=8, max_length=128)

    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    is_superuser: Optional[bool] = None


class UserLogin(BaseModel):
    """
    User login schema.
    """

    email: EmailStr
    password: str


class ChangePassword(BaseModel):
    """
    Change password schema.
    """

    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)


class UserResponse(UserBase):
    """
    User response schema.
    """

    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )