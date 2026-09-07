"""
Pydantic schemas for Model Usage.
"""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class UsageBase(BaseModel):
    """
    Base usage schema.
    """

    user_id: int
    organization_id: Optional[int] = None
    agent_id: Optional[int] = None
    model_id: int

    provider: str
    model_name: str

    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0

    request_count: int = 1
    latency_ms: Optional[int] = None

    cost: Decimal = Decimal("0.0")


class UsageCreate(UsageBase):
    """
    Schema for creating a usage record.
    """

    pass


class UsageUpdate(BaseModel):
    """
    Schema for updating a usage record.
    """

    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    total_tokens: Optional[int] = None
    request_count: Optional[int] = None
    latency_ms: Optional[int] = None
    cost: Optional[Decimal] = None


class UsageResponse(UsageBase):
    """
    Usage response schema.
    """

    id: int
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )