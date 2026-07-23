"""
Standard success response model.
"""

from __future__ import annotations

from typing import Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class SuccessResponse(BaseModel, Generic[T]):
    """
    Standard successful API response.
    """

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
    )

    success: bool = True

    message: str = "Success"

    data: T | None = None

    metadata: dict[str, Any] = Field(default_factory=dict)