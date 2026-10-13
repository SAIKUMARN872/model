"""Bounded conversation history for agent memory."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from threading import RLock
from typing import Any

from .utils import copy_metadata, validate_text


@dataclass(frozen=True)
class HistoryMessage:
    role: str
    content: str
    timestamp: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        role = validate_text(self.role, "role").lower()
        content = validate_text(self.content, "content")
        object.__setattr__(self, "role", role)
        object.__setattr__(self, "content", content)
        object.__setattr__(self, "metadata", copy_metadata(self.metadata))


class ConversationHistory:
    def __init__(self, max_messages: int = 100) -> None:
        if isinstance(max_messages, bool) or not isinstance(max_messages, int):
            raise ValueError("max_messages must be an integer.")
        if max_messages < 1:
            raise ValueError("max_messages must be at least 1.")
        self.max_messages = max_messages
        self._messages: dict[tuple, list[HistoryMessage]] = {}
        self._lock = RLock()

    @staticmethod
    def _scope(context: Any) -> tuple:
        if hasattr(context, "scope_key"):
            return context.scope_key()
        return (
            getattr(context, "user_id", None),
            getattr(context, "session_id", None),
            getattr(context, "conversation_id", None),
        )

    def add(
        self,
        context: Any,
        role: str,
        content: str,
        metadata: dict[str, Any] | None = None,
    ) -> HistoryMessage:
        message = HistoryMessage(
            role=role, content=content, metadata=metadata or {}
        )
        with self._lock:
            messages = self._messages.setdefault(self._scope(context), [])
            messages.append(message)
            del messages[:-self.max_messages]
        return message

    def get(
        self, context: Any, limit: int | None = None
    ) -> list[HistoryMessage]:
        if limit is not None:
            if isinstance(limit, bool) or not isinstance(limit, int) or limit < 0:
                raise ValueError("limit must be a non-negative integer.")
        with self._lock:
            messages = list(self._messages.get(self._scope(context), []))
        return messages if limit is None else messages[-limit:] if limit else []

    def clear(self, context: Any) -> int:
        with self._lock:
            messages = self._messages.pop(self._scope(context), [])
            return len(messages)
