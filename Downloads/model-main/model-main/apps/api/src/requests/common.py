"""
Common request models.
"""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class PaginationRequest(BaseModel):
    """
    Standard pagination request.
    """

    model_config = ConfigDict(extra="forbid")

    page: int = Field(
        default=1,
        ge=1,
        description="Page number.",
    )

    page_size: int = Field(
        default=20,
        ge=1,
        le=100,
        description="Number of items per page.",
    )


class SortRequest(BaseModel):
    """
    Sorting request.
    """

    model_config = ConfigDict(extra="forbid")

    sort_by: str | None = Field(
        default=None,
        description="Field used for sorting.",
    )

    descending: bool = Field(
        default=False,
        description="Sort in descending order.",
    ) 