from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class SessionHistory:
    """Store ordered messages for an inference session."""

    messages: list[dict[str, Any]] = field(default_factory=list)

    def add_message(
        self,
        message: dict[str, Any],
    ) -> None:
        self.messages.append(dict(message))

    def add_messages(
        self,
        messages: list[dict[str, Any]],
    ) -> None:
        for message in messages:
            self.add_message(message)

    def get_messages(self) -> list[dict[str, Any]]:
        return [dict(message) for message in self.messages]

    def clear(self) -> None:
        self.messages.clear()

    @property
    def count(self) -> int:
        return len(self.messages)


__all__ = ["SessionHistory"]
