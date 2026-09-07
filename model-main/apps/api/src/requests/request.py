"""
Base request model.
"""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from .metadata import RequestMetadata


class BaseRequest(BaseModel):
    """
    Base request inherited by all API request models.
    """

    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True,
    )

    metadata: RequestMetadata = Field(
        default_factory=RequestMetadata,
    )

    payload: dict[str, Any] = Field(
        default_factory=dict,
        description="Request payload.",
    ) 