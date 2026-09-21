from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any
from uuid import UUID, uuid4


@dataclass(frozen=True)
class ChatMessage:
    """
    Normalized chat message used by ModelNow providers.
    """

    role: str
    content: str

    name: str | None = None

    tool_call_id: str | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


@dataclass(frozen=True)
class ToolDefinition:
    """
    Normalized tool/function definition.

    Providers can translate this representation into their
    native tool-calling schema.
    """

    name: str

    description: str = ""

    parameters: dict[str, Any] = field(
        default_factory=dict
    )


@dataclass
class ChatRequest:
    """
    Normalized chat request entering the ModelNow provider layer.

    The routing engine, optimization engine, and provider adapters
    can operate on this common representation regardless of the
    underlying AI provider.
    """

    model: str

    messages: list[ChatMessage]

    temperature: float | None = None

    max_tokens: int | None = None

    top_p: float | None = None

    stream: bool = False

    tools: list[ToolDefinition] = field(
        default_factory=list
    )

    tool_choice: str | dict[str, Any] | None = None

    response_format: dict[str, Any] | None = None

    stop: str | list[str] | None = None

    seed: int | None = None

    user: str | None = None

    request_id: UUID = field(
        default_factory=uuid4
    )

    created_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def clone(
        self,
        **updates: Any,
    ) -> "ChatRequest":
        """
        Create a copy of this request with selected fields changed.
        """

        values = {
            "model": self.model,
            "messages": list(self.messages),
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "top_p": self.top_p,
            "stream": self.stream,
            "tools": list(self.tools),
            "tool_choice": self.tool_choice,
            "response_format": (
                dict(self.response_format)
                if self.response_format
                else None
            ),
            "stop": (
                list(self.stop)
                if isinstance(self.stop, list)
                else self.stop
            ),
            "seed": self.seed,
            "user": self.user,
            "request_id": self.request_id,
            "created_at": self.created_at,
            "metadata": dict(self.metadata),
        }

        values.update(updates)

        return ChatRequest(**values)

    @property
    def message_count(self) -> int:
        """Return the number of messages in the request."""

        return len(self.messages)

