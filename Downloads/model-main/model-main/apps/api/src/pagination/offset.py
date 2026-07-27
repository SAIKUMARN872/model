"""
Offset-based pagination.

Provides request/response models and helper utilities for
traditional offset/limit pagination.
"""

from __future__ import annotations

from math import ceil
from typing import Generic, Sequence, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class OffsetPaginationParams(BaseModel):
    """
    Offset pagination request parameters.
    """

    model_config = ConfigDict(
        extra="forbid",
        frozen=True,
    )

    offset: int = Field(
        default=0,
        ge=0,
        description="Starting record offset.",
    )

    limit: int = Field(
        default=20,
        ge=1,
        le=100,
        description="Maximum number of records to return.",
    )


class OffsetPage(BaseModel, Generic[T]):
    """
    Standard offset pagination response.
    """

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
    )

    items: Sequence[T]

    total: int

    offset: int

    limit: int

    page: int

    pages: int

    has_next: bool

    has_previous: bool


def build_offset_page(
    *,
    items: Sequence[T],
    total: int,
    offset: int,
    limit: int,
) -> OffsetPage[T]:
    """
    Build an offset pagination response.
    """

    pages = ceil(total / limit) if total > 0 else 1
    page = (offset // limit) + 1

    return OffsetPage(
        items=items,
        total=total,
        offset=offset,
        limit=limit,
        page=page,
        pages=pages,
        has_next=(offset + limit) < total,
        has_previous=offset > 0,
    ) 