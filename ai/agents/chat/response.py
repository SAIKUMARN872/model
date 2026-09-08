"""
Chat response models.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4


@dataclass
class ChatUsage:
    """
    Token and execution usage for a chat response.
    """

    input_tokens: int = 0

    output_tokens: int = 0

    total_tokens: int = 0

    estimated_cost: float = 0.0

    currency: str = "USD"

    model: str | None = None

    latency_ms: float | None = None

    def __post_init__(self) -> None:

        if self.input_tokens < 0:
            raise ValueError(
                "input_tokens cannot be negative"
            )

        if self.output_tokens < 0:
            raise ValueError(
                "output_tokens cannot be negative"
            )

        if self.total_tokens == 0:

            self.total_tokens = (
                self.input_tokens
                + self.output_tokens
            )

        if self.total_tokens < 0:
            raise ValueError(
                "total_tokens cannot be negative"
            )

        if self.estimated_cost < 0:
            raise ValueError(
                "estimated_cost cannot be negative"
            )

    def to_dict(self) -> dict[str, Any]:

        return {
            "input_tokens": self.input_tokens,
            "output_tokens": self.output_tokens,
            "total_tokens": self.total_tokens,
            "estimated_cost": (
                self.estimated_cost
            ),
            "currency": self.currency,
            "model": self.model,
            "latency_ms": self.latency_ms,
        }


@dataclass
class ChatResponse:
    """
    Standard response returned by ChatAgent.
    """

    content: str

    conversation_id: str | None = None

    request_id: str = field(
        default_factory=lambda: str(uuid4())
    )

    success: bool = True

    error: str | None = None

    usage: ChatUsage | None = None

    finish_reason: str = "stop"

    created_at: datetime = field(
        default_factory=lambda: datetime.now(
            timezone.utc
        )
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "request_id": self.request_id,
            "conversation_id": (
                self.conversation_id
            ),
            "content": self.content,
            "success": self.success,
            "error": self.error,
            "usage": (
                self.usage.to_dict()
                if self.usage
                else None
            ),
            "finish_reason": (
                self.finish_reason
            ),
            "created_at": (
                self.created_at.isoformat()
            ),
            "metadata": dict(
                self.metadata
            ),
        }

    @classmethod
    def success_response(
        cls,
        content: str,
        conversation_id: str | None = None,
        usage: ChatUsage | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> "ChatResponse":

        return cls(
            content=content,
            conversation_id=conversation_id,
            success=True,
            usage=usage,
            metadata=metadata or {},
        )

    @classmethod
    def error_response(
        cls,
        error: str,
        conversation_id: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> "ChatResponse":

        return cls(
            content="",
            conversation_id=conversation_id,
            success=False,
            error=error,
            finish_reason="error",
            metadata=metadata or {},
        )