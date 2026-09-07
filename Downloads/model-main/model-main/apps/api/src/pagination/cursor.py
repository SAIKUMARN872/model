"""
Cursor-based pagination.

Provides request/response models and helper utilities for
efficient pagination of large datasets.
"""

from __future__ import annotations

from typing import Generic, Optional, Sequence, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class CursorPaginationParams(BaseModel):
    """
    Cursor pagination request parameters.
    """

    model_config = ConfigDict(
        extra="forbid",
        frozen=True,
    )

    cursor: Optional[str] = Field(
        default=None,
        description="Opaque cursor returned by the previous request.",
    )

    limit: int = Field(
        default=20,
        ge=1,
        le=100,
        description="Maximum number of records to return.",
    )


class CursorPage(BaseModel, Generic[T]):
    """
    Cursor pagination response.
    """

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
    )

    items: Sequence[T]

    next_cursor: Optional[str] = None

    previous_cursor: Optional[str] = None

    has_next: bool = False

    has_previous: bool = False


def build_cursor_page(
    *,
    items: Sequence[T],
    next_cursor: str | None = None,
    previous_cursor: str | None = None,
    has_next: bool = False,
    has_previous: bool = False,
) -> CursorPage[T]:
    """
    Build a cursor pagination response.
    """

    return CursorPage(
        items=items,
        next_cursor=next_cursor,
        previous_cursor=previous_cursor,
        has_next=has_next,
        has_previous=has_previous,
    ) 