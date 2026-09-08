"""
Conversation management for the ModelNow chat system.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from threading import RLock
from typing import Any
from uuid import uuid4


class ConversationError(Exception):
    """Base conversation error."""


class ConversationNotFoundError(
    ConversationError
):
    """Raised when a conversation cannot be found."""


@dataclass
class ChatMessage:
    """
    Represents a single chat message.
    """

    role: str
    content: str

    message_id: str = field(
        default_factory=lambda: str(uuid4())
    )

    timestamp: datetime = field(
        default_factory=lambda: datetime.now(
            timezone.utc
        )
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    def __post_init__(self) -> None:

        if not self.role:
            raise ValueError(
                "Message role cannot be empty"
            )

        if not isinstance(
            self.content,
            str,
        ):
            raise TypeError(
                "Message content must be a string"
            )

    def to_dict(self) -> dict[str, Any]:

        return {
            "message_id": self.message_id,
            "role": self.role,
            "content": self.content,
            "timestamp": (
                self.timestamp.isoformat()
            ),
            "metadata": dict(
                self.metadata
            ),
        }


@dataclass
class Conversation:
    """
    Stores messages belonging to one conversation.
    """

    conversation_id: str = field(
        default_factory=lambda: str(uuid4())
    )

    user_id: str | None = None

    title: str | None = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    messages: list[ChatMessage] = field(
        default_factory=list
    )

    created_at: datetime = field(
        default_factory=lambda: datetime.now(
            timezone.utc
        )
    )

    updated_at: datetime = field(
        default_factory=lambda: datetime.now(
            timezone.utc
        )
    )

    def add_message(
        self,
        role: str,
        content: str,
        metadata: dict[str, Any] | None = None,
    ) -> ChatMessage:

        message = ChatMessage(
            role=role,
            content=content,
            metadata=metadata or {},
        )

        self.messages.append(
            message
        )

        self.updated_at = (
            datetime.now(timezone.utc)
        )

        return message

    def add_user_message(
        self,
        content: str,
        metadata: dict[str, Any] | None = None,
    ) -> ChatMessage:

        return self.add_message(
            role="user",
            content=content,
            metadata=metadata,
        )

    def add_assistant_message(
        self,
        content: str,
        metadata: dict[str, Any] | None = None,
    ) -> ChatMessage:

        return self.add_message(
            role="assistant",
            content=content,
            metadata=metadata,
        )

    def add_system_message(
        self,
        content: str,
        metadata: dict[str, Any] | None = None,
    ) -> ChatMessage:

        return self.add_message(
            role="system",
            content=content,
            metadata=metadata,
        )

    def last_message(
        self,
    ) -> ChatMessage | None:

        if not self.messages:
            return None

        return self.messages[-1]

    def user_messages(
        self,
    ) -> list[ChatMessage]:

        return [
            message
            for message in self.messages
            if message.role == "user"
        ]

    def assistant_messages(
        self,
    ) -> list[ChatMessage]:

        return [
            message
            for message in self.messages
            if message.role == "assistant"
        ]

    def get_messages(
        self,
        limit: int | None = None,
    ) -> list[ChatMessage]:

        if limit is None:
            return list(self.messages)

        if limit <= 0:
            return []

        return list(
            self.messages[-limit:]
        )

    def clear(self) -> None:

        self.messages.clear()

        self.updated_at = (
            datetime.now(timezone.utc)
        )

    def message_count(self) -> int:

        return len(self.messages)

    def to_dict(
        self,
        include_messages: bool = True,
    ) -> dict[str, Any]:

        result = {
            "conversation_id": (
                self.conversation_id
            ),
            "user_id": self.user_id,
            "title": self.title,
            "metadata": dict(
                self.metadata
            ),
            "created_at": (
                self.created_at.isoformat()
            ),
            "updated_at": (
                self.updated_at.isoformat()
            ),
            "message_count": (
                self.message_count()
            ),
        }

        if include_messages:
            result["messages"] = [
                message.to_dict()
                for message in self.messages
            ]

        return result


class ConversationManager:
    """
    Thread-safe in-memory conversation manager.

    A database-backed implementation can later replace
    this class without changing the ChatAgent API.
    """

    def __init__(self) -> None:

        self._conversations: dict[
            str,
            Conversation,
        ] = {}

        self._lock = RLock()

    def create(
        self,
        user_id: str | None = None,
        title: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> Conversation:

        conversation = Conversation(
            user_id=user_id,
            title=title,
            metadata=metadata or {},
        )

        with self._lock:

            self._conversations[
                conversation.conversation_id
            ] = conversation

        return conversation

    def get(
        self,
        conversation_id: str,
    ) -> Conversation | None:

        with self._lock:

            return self._conversations.get(
                conversation_id
            )

    def require(
        self,
        conversation_id: str,
    ) -> Conversation:

        conversation = self.get(
            conversation_id
        )

        if conversation is None:
            raise ConversationNotFoundError(
                f"Conversation not found: "
                f"{conversation_id}"
            )

        return conversation

    def delete(
        self,
        conversation_id: str,
    ) -> bool:

        with self._lock:

            if (
                conversation_id
                not in self._conversations
            ):
                return False

            del self._conversations[
                conversation_id
            ]

            return True

    def list_for_user(
        self,
        user_id: str,
    ) -> list[Conversation]:

        with self._lock:

            return [
                conversation
                for conversation
                in self._conversations.values()
                if conversation.user_id
                == user_id
            ]

    def all(
        self,
    ) -> list[Conversation]:

        with self._lock:
            return list(
                self._conversations.values()
            )

    def clear(self) -> None:

        with self._lock:
            self._conversations.clear()