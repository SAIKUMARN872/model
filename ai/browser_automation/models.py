"""
Core data models for the AI platform.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


@dataclass
class Message:
    """Represents an AI conversation message."""

    role: str

    content: str

    message_id: str = field(
        default_factory=lambda:
        f"msg_{uuid4().hex}"
    )

    timestamp: datetime = field(
        default_factory=utc_now
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        self.role = self.role.strip().lower()

        if not self.role:

            raise ValueError(
                "Message role cannot be empty."
            )

        if not isinstance(
            self.content,
            str,
        ):

            raise TypeError(
                "Message content must be a string."
            )

    def to_dict(
        self,
    ) -> dict[str, Any]:

        return {
            "message_id": self.message_id,
            "role": self.role,
            "content": self.content,
            "timestamp": self.timestamp.isoformat(),
            "metadata": self.metadata,
        }


@dataclass
class ToolCall:
    """Represents an AI tool invocation."""

    tool_name: str

    arguments: dict[str, Any] = field(
        default_factory=dict
    )

    call_id: str = field(
        default_factory=lambda:
        f"call_{uuid4().hex}"
    )

    result: Any = None

    error: str | None = None

    def success(self) -> bool:

        return self.error is None

    def to_dict(
        self,
    ) -> dict[str, Any]:

        return {
            "call_id": self.call_id,
            "tool_name": self.tool_name,
            "arguments": self.arguments,
            "result": self.result,
            "error": self.error,
        }


@dataclass
class AIResponse:
    """Standardized AI response."""

    content: str

    response_id: str = field(
        default_factory=lambda:
        f"resp_{uuid4().hex}"
    )

    model: str | None = None

    finish_reason: str | None = None

    usage: dict[str, int | float] = field(
        default_factory=dict
    )

    tool_calls: list[ToolCall] = field(
        default_factory=list
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    created_at: datetime = field(
        default_factory=utc_now
    )

    def to_dict(
        self,
    ) -> dict[str, Any]:

        return {
            "response_id": self.response_id,
            "content": self.content,
            "model": self.model,
            "finish_reason": self.finish_reason,
            "usage": self.usage,
            "tool_calls": [
                call.to_dict()
                for call in self.tool_calls
            ],
            "metadata": self.metadata,
            "created_at": self.created_at.isoformat(),
        }


@dataclass
class AIRequest:
    """Standardized AI request."""

    prompt: str

    request_id: str = field(
        default_factory=lambda:
        f"req_{uuid4().hex}"
    )

    model: str | None = None

    temperature: float | None = None

    max_tokens: int | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        if not self.prompt.strip():

            raise ValueError(
                "Prompt cannot be empty."
            )

        if (
            self.temperature is not None
            and not 0 <= self.temperature <= 2
        ):

            raise ValueError(
                "Temperature must be between 0 and 2."
            )

        if (
            self.max_tokens is not None
            and self.max_tokens <= 0
        ):

            raise ValueError(
                "max_tokens must be positive."
            )