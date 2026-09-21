"""
Pydantic schemas for AI models.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ModelBase(BaseModel):
    """
    Base schema for AI models.
    """

    name: str
    provider: str
    version: str

    description: Optional[str] = None
    context_window: Optional[int] = None
    max_output_tokens: Optional[int] = None

    supports_streaming: bool = True
    supports_tools: bool = False
    supports_vision: bool = False

    is_active: bool = True


class ModelCreate(ModelBase):
    """
    Schema used when creating a model.
    """

    pass


class ModelUpdate(BaseModel):
    """
    Schema used when updating a model.
    """

    name: Optional[str] = None
    provider: Optional[str] = None
    version: Optional[str] = None

    description: Optional[str] = None
    context_window: Optional[int] = None
    max_output_tokens: Optional[int] = None

    supports_streaming: Optional[bool] = None
    supports_tools: Optional[bool] = None
    supports_vision: Optional[bool] = None

    is_active: Optional[bool] = None


class ModelResponse(ModelBase):
    """
    Schema returned by the API.
    """

    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )