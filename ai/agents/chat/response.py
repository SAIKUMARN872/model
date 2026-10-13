from __future__ import annotations

from dataclasses import dataclass, field
from uuid import uuid4


@dataclass(frozen=True, slots=True)
class ChatResponse:
    content: str
    conversation_id: str
    message_id: str = field(default_factory=lambda: str(uuid4()))
    model: str | None = None
    finish_reason: str = "stop"
    usage: dict[str, int] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not isinstance(self.content, str) or not self.content.strip():
            raise ValueError("Response content must be a non-empty string")
        if not self.conversation_id.strip():
            raise ValueError("conversation_id must not be blank")
        if not self.message_id.strip():
            raise ValueError("message_id must not be blank")
        if self.model is not None and not self.model.strip():
            raise ValueError("model must be None or a non-empty string")
        if not self.finish_reason.strip():
            raise ValueError("finish_reason must not be blank")
        if any(
            not isinstance(key, str)
            or not key.strip()
            or not isinstance(value, int)
            or isinstance(value, bool)
            or value < 0
            for key, value in self.usage.items()
        ):
            raise ValueError("usage must contain non-negative integer values")
