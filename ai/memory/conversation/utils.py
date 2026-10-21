"""Shared conversation contracts, validation, and serialization."""

from __future__ import annotations

import json
import re
import unicodedata
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from ..exceptions import MemoryValidationError


MAX_CONVERSATION_ID_LENGTH = 128
MAX_MESSAGE_CONTENT_CHARS = 200_000
MAX_METADATA_BYTES = 32_768
MAX_ROLE_LENGTH = 32
ALLOWED_ROLES = frozenset({"system", "user", "assistant", "tool"})


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def validate_identifier(value: str, field_name: str, max_length: int = 128) -> str:
    if not isinstance(value, str):
        raise MemoryValidationError(f"{field_name} must be a string")
    value = value.strip()
    if not value or len(value) > max_length:
        raise MemoryValidationError(
            f"{field_name} must contain 1 to {max_length} characters"
        )
    if any(ord(char) < 32 for char in value):
        raise MemoryValidationError(f"{field_name} contains control characters")
    return value


def normalize_content(content: str) -> str:
    if not isinstance(content, str):
        raise MemoryValidationError("message content must be a string")
    content = unicodedata.normalize("NFC", content).strip()
    if not content:
        raise MemoryValidationError("message content must not be empty")
    if len(content) > MAX_MESSAGE_CONTENT_CHARS:
        raise MemoryValidationError(
            f"message content exceeds {MAX_MESSAGE_CONTENT_CHARS} characters"
        )
    return content


def validate_metadata(metadata: dict[str, Any] | None) -> dict[str, Any]:
    if metadata is None:
        return {}
    if not isinstance(metadata, dict):
        raise MemoryValidationError("metadata must be an object")

    try:
        encoded = json.dumps(
            metadata, ensure_ascii=False, allow_nan=False, separators=(",", ":")
        )
        if len(encoded.encode("utf-8")) > MAX_METADATA_BYTES:
            raise MemoryValidationError("metadata exceeds the size limit")
        decoded = json.loads(encoded)
    except (TypeError, ValueError, RecursionError) as exc:
        raise MemoryValidationError("metadata must contain valid JSON values") from exc

    if not isinstance(decoded, dict):
        raise MemoryValidationError("metadata must be an object")
    return decoded


def parse_datetime(value: datetime | str, field_name: str) -> datetime:
    if isinstance(value, str):
        try:
            value = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError as exc:
            raise MemoryValidationError(f"{field_name} must be an ISO timestamp") from exc
    if not isinstance(value, datetime) or value.tzinfo is None:
        raise MemoryValidationError(f"{field_name} must be timezone-aware")
    return value.astimezone(timezone.utc)


@dataclass(frozen=True, slots=True)
class ConversationMessage:
    message_id: str
    conversation_id: str
    tenant_id: str
    user_id: str
    role: str
    content: str
    sequence: int
    created_at: datetime = field(default_factory=utc_now)
    metadata: dict[str, Any] = field(default_factory=dict)
    idempotency_key: str | None = None

    def __post_init__(self) -> None:
        for name in ("message_id", "conversation_id", "tenant_id", "user_id"):
            object.__setattr__(
                self, name,
                validate_identifier(getattr(self, name), name, MAX_CONVERSATION_ID_LENGTH),
            )

        if self.role not in ALLOWED_ROLES:
            raise MemoryValidationError(f"unsupported message role: {self.role!r}")
        object.__setattr__(self, "content", normalize_content(self.content))
        if isinstance(self.sequence, bool) or not isinstance(self.sequence, int) or self.sequence < 1:
            raise MemoryValidationError("sequence must be a positive integer")
        object.__setattr__(self, "created_at", parse_datetime(self.created_at, "created_at"))
        object.__setattr__(self, "metadata", validate_metadata(self.metadata))
        if self.idempotency_key is not None:
            object.__setattr__(
                self,
                "idempotency_key",
                validate_identifier(self.idempotency_key, "idempotency_key", 256),
            )

    @classmethod
    def create(
        cls,
        *,
        conversation_id: str,
        tenant_id: str,
        user_id: str,
        role: str,
        content: str,
        sequence: int,
        metadata: dict[str, Any] | None = None,
        idempotency_key: str | None = None,
        message_id: str | None = None,
        created_at: datetime | None = None,
    ) -> "ConversationMessage":
        return cls(
            message_id=message_id or str(uuid.uuid4()),
            conversation_id=conversation_id,
            tenant_id=tenant_id,
            user_id=user_id,
            role=role,
            content=content,
            sequence=sequence,
            metadata=metadata or {},
            idempotency_key=idempotency_key,
            created_at=created_at or utc_now(),
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "message_id": self.message_id,
            "conversation_id": self.conversation_id,
            "tenant_id": self.tenant_id,
            "user_id": self.user_id,
            "role": self.role,
            "content": self.content,
            "sequence": self.sequence,
            "created_at": self.created_at.isoformat(),
            "metadata": validate_metadata(self.metadata),
            "idempotency_key": self.idempotency_key,
        }


@dataclass(frozen=True, slots=True)
class Conversation:
    conversation_id: str
    tenant_id: str
    user_id: str
    title: str = "New conversation"
    created_at: datetime = field(default_factory=utc_now)
    updated_at: datetime = field(default_factory=utc_now)
    version: int = 1
    archived: bool = False
    summary: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        for name in ("conversation_id", "tenant_id", "user_id"):
            object.__setattr__(
                self, name,
                validate_identifier(getattr(self, name), name, MAX_CONVERSATION_ID_LENGTH),
            )
        object.__setattr__(self, "title", normalize_content(self.title)[:512])
        object.__setattr__(self, "created_at", parse_datetime(self.created_at, "created_at"))
        object.__setattr__(self, "updated_at", parse_datetime(self.updated_at, "updated_at"))
        if self.updated_at < self.created_at:
            raise MemoryValidationError("updated_at cannot precede created_at")
        if isinstance(self.version, bool) or not isinstance(self.version, int) or self.version < 1:
            raise MemoryValidationError("version must be a positive integer")
        if not isinstance(self.archived, bool):
            raise MemoryValidationError("archived must be a boolean")
        if self.summary is not None:
            object.__setattr__(self, "summary", normalize_content(self.summary))
        object.__setattr__(self, "metadata", validate_metadata(self.metadata))

    def to_dict(self) -> dict[str, Any]:
        return {
            "conversation_id": self.conversation_id,
            "tenant_id": self.tenant_id,
            "user_id": self.user_id,
            "title": self.title,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "version": self.version,
            "archived": self.archived,
            "summary": self.summary,
            "metadata": validate_metadata(self.metadata),
        }


def estimate_tokens(text: str) -> int:
    """Conservative heuristic only; not a model-specific tokenizer."""
    if not isinstance(text, str):
        raise MemoryValidationError("text must be a string")
    return max(1, (len(text.encode("utf-8")) + 2) // 3)


def redact_for_log(value: str, max_chars: int = 160) -> str:
    """Return a short sanitized diagnostic; do not log message bodies by default."""
    if not isinstance(value, str):
        return "<non-string>"
    value = re.sub(r"[\r\n\t]+", " ", value)
    value = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", value)
    return value[:max_chars]
