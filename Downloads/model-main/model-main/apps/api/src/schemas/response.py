"""
Common response schemas.

Reusable response models for all API endpoints.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Generic, TypeVar
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class ResponseMetadata(BaseModel):
    """
    Metadata returned with every API response.
    """

    model_config = ConfigDict(extra="ignore")

    request_id: UUID | None = Field(
        default=None,
        description="Request identifier.",
    )

    trace_id: str | None = Field(
        default=None,
        description="Distributed tracing identifier.",
    )

    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Response timestamp (UTC).",
    )

    processing_time_ms: float | None = Field(
        default=None,
        ge=0,
        description="Server processing time.",
    )

    version: str = Field(
        default="v1",
        description="API version.",
    )


class ErrorDetail(BaseModel):
    """
    Error information.
    """

    model_config = ConfigDict(extra="ignore")

    code: str

    message: str

    field: str | None = None


class PaginationMetadata(BaseModel):
    """
    Pagination metadata.
    """

    model_config = ConfigDict(extra="ignore")

    page: int

    page_size: int

    total_items: int

    total_pages: int

    has_next: bool

    has_previous: bool


class BaseResponse(BaseModel, Generic[T]):
    """
    Standard API response.
    """

    model_config = ConfigDict(arbitrary_types_allowed=True)

    success: bool = True

    message: str = "Success"

    data: T | None = None

    metadata: ResponseMetadata = Field(
        default_factory=ResponseMetadata,
    )


class PaginatedResponse(BaseResponse[list[T]], Generic[T]):
    """
    Paginated API response.
    """

    pagination: PaginationMetadata


class ErrorResponse(BaseModel):
    """
    Standard error response.
    """

    model_config = ConfigDict(extra="ignore")

    success: bool = False

    message: str

    errors: list[ErrorDetail] = Field(
        default_factory=list,
    )

    metadata: ResponseMetadata = Field(
        default_factory=ResponseMetadata,
    )


class SuccessResponse(BaseModel):
    """
    Simple success response.
    """

    model_config = ConfigDict(extra="ignore")

    success: bool = True

    message: str = "Operation completed successfully."

    metadata: ResponseMetadata = Field(
        default_factory=ResponseMetadata,
    )


class DeleteResponse(BaseModel):
    """
    Delete operation response.
    """

    model_config = ConfigDict(extra="ignore")

    success: bool = True

    message: str = "Resource deleted successfully."

    deleted_id: str | None = None

    metadata: ResponseMetadata = Field(
        default_factory=ResponseMetadata,
    )