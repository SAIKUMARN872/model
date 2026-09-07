"""
Standard error response models.
"""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ErrorDetail(BaseModel):
    """
    Error information.
    """

    model_config = ConfigDict(extra="forbid")

    code: str = Field(
        ...,
        description="Application error code.",
    )

    message: str = Field(
        ...,
        description="Human-readable error message.",
    )

    field: str | None = Field(
        default=None,
        description="Field that caused the error.",
    )


class ErrorResponse(BaseModel):
    """
    Standard API error response.
    """

    model_config = ConfigDict(extra="forbid")

    success: bool = False

    error: ErrorDetail

    trace_id: str | None = None

    metadata: dict[str, Any] = Field(default_factory=dict)