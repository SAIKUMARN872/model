"""Conversation lifecycle, message coordination, and in-memory test repository."""

from __future__ import annotations

import threading
from dataclasses import replace
from datetime import datetime
from typing import Any
from uuid import uuid4

from ..exceptions import (
    MemoryConflictError,
    MemoryNotFoundError,
    MemoryValidationError,
)
from .history import ConversationHistory
from .utils import (
    Conversation,
    ConversationMessage,
    utc_now,
    validate_identifier,
    validate_metadata,
)


class InMemoryConversationRepository:
    """Thread-safe test/development repository.

    This implementation is not durable and is not suitable as a multi-worker
    production database. Replace it with a transactional persistent adapter.
    """

    def __init__(self) -> None:
        self._lock = threading.RLock()
        self._conversations: dict[tuple[str, str, str], Conversation] = {}
        self._messages: dict[tuple[str, str, str], list[ConversationMessage]] = {}
        self._idempotency: dict[tuple[str, str, str, str], ConversationMessage] = {}

    @staticmethod
    def _key(tenant_id: str, user_id: str, conversation_id: str) -> tuple[str, str, str]:
        return (
            validate_identifier(tenant_id, "tenant_id"),
            validate_identifier(user_id, "user_id"),
            validate_identifier(conversation_id, "conversation_id"),
        )

    def create(self, conversation: Conversation) -> Conversation:
        key = self._key(conversation.tenant_id, conversation.user_id, conversation.conversation_id)
        with self._lock:
            if key in self._conversations:
                raise MemoryConflictError("Conversation already exists")
            self._conversations[key] = conversation
            self._messages[key] = []
            return conversation

    def get(self, tenant_id: str, user_id: str, conversation_id: str) -> Conversation | None:
        key = self._key(tenant_id, user_id, conversation_id)
        with self._lock:
            return self._conversations.get(key)

    def save(self, conversation: Conversation, expected_version: int) -> Conversation:
        key = self._key(conversation.tenant_id, conversation.user_id, conversation.conversation_id)
        with self._lock:
            current = self._conversations.get(key)
            if current is None:
                raise MemoryNotFoundError("Conversation was not found")
            if current.version != expected_version:
                raise MemoryConflictError("Conversation version conflict")
            if conversation.version != expected_version + 1:
                raise MemoryValidationError("Saved conversation version must increment by one")
            self._conversations[key] = conversation
            return conversation

    def append_message(
        self,
        message: ConversationMessage,
        expected_version: int,
    ) -> ConversationMessage:
        key = self._key(message.tenant_id, message.user_id, message.conversation_id)
        with self._lock:
            conversation = self._conversations.get(key)
            if conversation is None:
                raise MemoryNotFoundError("Conversation was not found")
            if conversation.archived:
                raise MemoryConflictError("Archived conversations cannot accept messages")
            if conversation.version != expected_version:
                raise MemoryConflictError("Conversation version conflict")

            if message.idempotency_key:
                idem_key = (*key, message.idempotency_key)
                existing = self._idempotency.get(idem_key)
                if existing is not None:
                    return existing

            messages = self._messages[key]
            expected_sequence = len(messages) + 1
            if message.sequence != expected_sequence:
                raise MemoryConflictError("Message sequence conflict")

            messages.append(message)
            self._conversations[key] = replace(
                conversation,
                updated_at=max(utc_now(), conversation.updated_at),
                version=conversation.version + 1,
            )
            if message.idempotency_key:
                self._idempotency[(*key, message.idempotency_key)] = message
            return message

    def list_messages(
        self,
        tenant_id: str,
        user_id: str,
        conversation_id: str,
        *,
        before_sequence: int | None,
        limit: int,
    ) -> list[ConversationMessage]:
        key = self._key(tenant_id, user_id, conversation_id)
        if isinstance(limit, bool) or not isinstance(limit, int) or limit < 1:
            raise MemoryValidationError("limit must be a positive integer")
        with self._lock:
            if key not in self._conversations:
                raise MemoryNotFoundError("Conversation was not found")
            messages = self._messages[key]
            if before_sequence is not None:
                messages = [m for m in messages if m.sequence < before_sequence]
            return list(messages[-limit:])

    def delete(self, tenant_id: str, user_id: str, conversation_id: str) -> bool:
        key = self._key(tenant_id, user_id, conversation_id)
        with self._lock:
            if key not in self._conversations:
                return False
            del self._conversations[key]
            self._messages.pop(key, None)
            for idem_key in [k for k in self._idempotency if k[:3] == key]:
                del self._idempotency[idem_key]
            return True


class ConversationManager:
    """Tenant-scoped conversation service using an injected repository."""

    def __init__(
        self,
        repository: Any,
        *,
        tenant_id: str,
        user_id: str,
        clock=utc_now,
    ) -> None:
        if repository is None:
            raise MemoryValidationError("repository is required")
        if not callable(clock):
            raise MemoryValidationError("clock must be callable")
        self.repository = repository
        self.tenant_id = validate_identifier(tenant_id, "tenant_id")
        self.user_id = validate_identifier(user_id, "user_id")
        self._clock = clock
        self.history = ConversationHistory(
            repository, tenant_id=self.tenant_id, user_id=self.user_id
        )

    def create(
        self,
        *,
        title: str = "New conversation",
        metadata: dict[str, Any] | None = None,
        conversation_id: str | None = None,
    ) -> Conversation:
        now = self._clock()
        conversation = Conversation(
            conversation_id=conversation_id or str(uuid4()),
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            title=title,
            created_at=now,
            updated_at=now,
            metadata=validate_metadata(metadata),
        )
        return self.repository.create(conversation)

    def get(self, conversation_id: str) -> Conversation:
        conversation_id = validate_identifier(conversation_id, "conversation_id")
        conversation = self.repository.get(self.tenant_id, self.user_id, conversation_id)
        if conversation is None:
            raise MemoryNotFoundError("Conversation was not found")
        return conversation

    def append(
        self,
        conversation_id: str,
        *,
        role: str,
        content: str,
        metadata: dict[str, Any] | None = None,
        idempotency_key: str | None = None,
        expected_version: int | None = None,
    ) -> ConversationMessage:
        conversation = self.get(conversation_id)
        if expected_version is not None and expected_version != conversation.version:
            raise MemoryConflictError("Conversation version conflict")
        if conversation.archived:
            raise MemoryConflictError("Archived conversations cannot accept messages")

        page = self.history.page(conversation_id, limit=200)
        sequence = page.messages[-1].sequence + 1 if page.messages else 1
        message = ConversationMessage.create(
            conversation_id=conversation.conversation_id,
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            role=role,
            content=content,
            sequence=sequence,
            metadata=metadata,
            idempotency_key=idempotency_key,
        )
        return self.repository.append_message(message, conversation.version)

    def list_messages(
        self,
        conversation_id: str,
        *,
        limit: int = 50,
        before_sequence: int | None = None,
    ):
        return self.history.page(
            conversation_id, limit=limit, before_sequence=before_sequence
        )

    def rename(
        self,
        conversation_id: str,
        title: str,
        *,
        expected_version: int | None = None,
    ) -> Conversation:
        current = self.get(conversation_id)
        if expected_version is not None and current.version != expected_version:
            raise MemoryConflictError("Conversation version conflict")
        updated = replace(
            current,
            title=title,
            updated_at=max(self._clock(), current.updated_at),
            version=current.version + 1,
        )
        return self.repository.save(updated, expected_version=current.version)

    def archive(
        self,
        conversation_id: str,
        *,
        expected_version: int | None = None,
    ) -> Conversation:
        current = self.get(conversation_id)
        if expected_version is not None and current.version != expected_version:
            raise MemoryConflictError("Conversation version conflict")
        if current.archived:
            return current
        updated = replace(
            current,
            archived=True,
            updated_at=max(self._clock(), current.updated_at),
            version=current.version + 1,
        )
        return self.repository.save(updated, expected_version=current.version)

    def update_summary(
        self,
        conversation_id: str,
        summary: str,
        *,
        expected_version: int | None = None,
    ) -> Conversation:
        current = self.get(conversation_id)
        if expected_version is not None and current.version != expected_version:
            raise MemoryConflictError("Conversation version conflict")
        updated = replace(
            current,
            summary=summary,
            updated_at=max(self._clock(), current.updated_at),
            version=current.version + 1,
        )
        return self.repository.save(updated, expected_version=current.version)

    def delete(self, conversation_id: str) -> bool:
        return self.repository.delete(self.tenant_id, self.user_id, conversation_id)
