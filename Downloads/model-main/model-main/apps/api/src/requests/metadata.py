"""
Request metadata.
"""

from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field


class RequestMetadata(BaseModel):
    """
    Metadata attached to every request.
    """

    model_config = ConfigDict(extra="ignore")

    request_id: str = Field(
        default_factory=lambda: str(uuid4()),
    )

    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
    )

    client_ip: str | None = None

    user_agent: str | None = None

    correlation_id: str | None = None 