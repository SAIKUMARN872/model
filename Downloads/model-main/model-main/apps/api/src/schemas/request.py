"""
Common request schemas.

Base request models shared across the application.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field


class RequestMetadata(BaseModel):
    """
    Metadata attached to every request.
    """

    model_config = ConfigDict(extra="ignore")

    request_id: UUID = Field(
        default_factory=uuid4,
        description="Unique request identifier.",
    )

    correlation_id: UUID | None = Field(
        default=None,
        description="Correlation identifier for distributed tracing.",
    )

    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Request creation time (UTC).",
    )

    client_ip: str | None = Field(
        default=None,
        description="Client IP address.",
    )

    user_agent: str | None = Field(
        default=None,
        description="User-Agent header.",
    )

    locale: str | None = Field(
        default=None,
        description="Client locale.",
    )


class BaseRequest(BaseModel):
    """
    Base request model.

    All request schemas can inherit from this class.
    """

    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True,
        str_strip_whitespace=True,
    )

    metadata: RequestMetadata = Field(
        default_factory=RequestMetadata,
    )


class PaginationRequest(BaseModel):
    """
    Pagination parameters.
    """

    model_config = ConfigDict(extra="forbid")

    page: int = Field(
        default=1,
        ge=1,
        description="Current page.",
    )

    page_size: int = Field(
        default=20,
        ge=1,
        le=100,
        description="Items per page.",
    )


class SearchRequest(BaseModel):
    """
    Search parameters.
    """

    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    query: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Search query.",
    )


class SortRequest(BaseModel):
    """
    Sorting parameters.
    """

    model_config = ConfigDict(extra="forbid")

    sort_by: str = Field(
        default="created_at",
        description="Field to sort by.",
    )

    order: str = Field(
        default="desc",
        pattern="^(asc|desc)$",
        description="Sort order.",
    )


class FilterRequest(BaseModel):
    """
    Generic filter parameters.
    """

    model_config = ConfigDict(extra="allow")

    filters: dict[str, Any] = Field(
        default_factory=dict,
        description="Dynamic filter values.",
    )


class ListRequest(
    PaginationRequest,
    SearchRequest,
    SortRequest,
    FilterRequest,
):
    """
    Generic list request supporting pagination,
    search, sorting, and filtering.
    """

    model_config = ConfigDict(extra="forbid") 