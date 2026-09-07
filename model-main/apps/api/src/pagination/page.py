"""
Page-based pagination.

Provides request/response models and helper utilities for
page-number pagination.
"""

from __future__ import annotations

from math import ceil
from typing import Generic, Sequence, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class PagePaginationParams(BaseModel):
    """
    Page pagination request parameters.
    """

    model_config = ConfigDict(
        extra="forbid",
        frozen=True,
    )

    page: int = Field(
        default=1,
        ge=1,
        description="Current page number.",
    )

    size: int = Field(
        default=20,
        ge=1,
        le=100,
        description="Number of records per page.",
    )


class PageInfo(BaseModel):
    """
    Pagination metadata.
    """

    page: int

    size: int

    total_items: int

    total_pages: int

    has_next: bool

    has_previous: bool


class Page(BaseModel, Generic[T]):
    """
    Standard page-based pagination response.
    """

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
    )

    items: Sequence[T]

    page_info: PageInfo


def build_page(
    *,
    items: Sequence[T],
    total_items: int,
    page: int,
    size: int,
) -> Page[T]:
    """
    Build a page-based pagination response.
    """

    total_pages = max(1, ceil(total_items / size))

    page_info = PageInfo(
        page=page,
        size=size,
        total_items=total_items,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_previous=page > 1,
    )

    return Page(
        items=items,
        page_info=page_info,
    ) 