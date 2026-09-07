"""
AI model schemas.

Pydantic request and response models for AI model management.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ModelResponse(BaseModel):
    """
    AI model response.
    """

    model_config = ConfigDict(from_attributes=True)

    id: str

    name: str

    provider: str

    version: str | None = None

    description: str | None = None

    context_window: int | None = None

    max_output_tokens: int | None = None

    supports_streaming: bool = True

    supports_tools: bool = False

    supports_vision: bool = False

    is_active: bool = True

    created_at: datetime | None = None

    updated_at: datetime | None = None


class ModelCreate(BaseModel):
    """
    Create AI model request.
    """

    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    name: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    provider: str = Field(
        ...,
        min_length=2,
        max_length=50,
    )

    version: str | None = None

    description: str | None = None

    context_window: int | None = Field(
        default=None,
        ge=1,
    )

    max_output_tokens: int | None = Field(
        default=None,
        ge=1,
    )

    supports_streaming: bool = True

    supports_tools: bool = False

    supports_vision: bool = False


class ModelUpdate(BaseModel):
    """
    Update AI model request.
    """

    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    description: str | None = None

    version: str | None = None

    context_window: int | None = Field(
        default=None,
        ge=1,
    )

    max_output_tokens: int | None = Field(
        default=None,
        ge=1,
    )

    supports_streaming: bool | None = None

    supports_tools: bool | None = None

    supports_vision: bool | None = None

    is_active: bool | None = None


class UpdateDefaultModelRequest(BaseModel):
    """
    Set default AI model.
    """

    model_config = ConfigDict(extra="forbid")

    model_id: str


class ModelHealthResponse(BaseModel):
    """
    AI model health.
    """

    model_config = ConfigDict(extra="ignore")

    model: str

    provider: str

    status: str

    latency_ms: float

    available: bool

    checked_at: datetime


class ModelListResponse(BaseModel):
    """
    AI model list.
    """

    model_config = ConfigDict(extra="ignore")

    total: int

    items: list[ModelResponse]


class ProviderResponse(BaseModel):
    """
    AI provider information.
    """

    model_config = ConfigDict(extra="ignore")

    name: str

    models: list[str]

    healthy: bool

    metadata: dict[str, Any] = Field(default_factory=dict) 