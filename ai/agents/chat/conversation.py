from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Literal
from uuid import uuid4


MessageRole = Literal["system", "user", "assistant"]


@dataclass(frozen=True, slots=True)
class ChatMessage:
    role: MessageRole
    content: str
    message_id: str = field(default_factory=lambda: str(uuid4()))
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def __post_init__(self) -> None:
        if self.role not in {"system", "user", "assistant"}:
            raise ValueError("Unsupported chat message role")
        if not isinstance(self.content, str) or not self.content.strip():
            raise ValueError("Message content must be a non-empty string")
        if not self.message_id.strip():
            raise ValueError("message_id must not be blank")


@dataclass(slots=True)
class Conversation:
    conversation_id: str = field(default_factory=lambda: str(uuid4()))
    messages: list[ChatMessage] = field(default_factory=list)
    metadata: dict[str, object] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.conversation_id.strip():
            raise ValueError("conversation_id must not be blank")
        if any(not isinstance(message, ChatMessage) for message in self.messages):
            raise TypeError("messages must contain ChatMessage instances")

    def add_message(self, message: ChatMessage) -> None:
        if not isinstance(message, ChatMessage):
            raise TypeError("message must be a ChatMessage instance")
        self.messages.append(message)

    def history(self, limit: int | None = None) -> list[ChatMessage]:
        if limit is not None and limit < 0:
            raise ValueError("limit must be non-negative")
        if limit is None or limit == 0:
            return list(self.messages)
        return list(self.messages[-limit:])
