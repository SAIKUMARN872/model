from __future__ import annotations

import hashlib
import json
import math
import re
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Mapping


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def normalize_datetime(value: datetime, field_name: str = "timestamp") -> datetime:
    if not isinstance(value, datetime):
        raise ValueError(f"{field_name} must be a datetime")
    if value.tzinfo is None or value.utcoffset() is None:
        raise ValueError(f"{field_name} must include a timezone")
    return value.astimezone(timezone.utc)


def validate_identifier(value: str, field_name: str = "identifier") -> str:
    if not isinstance(value, str):
        raise ValueError(f"{field_name} must be a string")
    value = value.strip()
    if not value or len(value) > 200:
        raise ValueError(f"{field_name} must contain 1-200 characters")
    if any(ord(char) < 32 for char in value):
        raise ValueError(f"{field_name} contains control characters")
    return value


def validate_content(value: str, max_length: int = 100_000) -> str:
    if not isinstance(value, str):
        raise ValueError("content must be a string")
    value = value.strip()
    if not value:
        raise ValueError("content cannot be empty")
    if len(value) > max_length:
        raise ValueError(f"content exceeds {max_length} characters")
    return value


def validate_importance(value: float) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError("importance must be numeric")
    value = float(value)
    if not math.isfinite(value) or not 0.0 <= value <= 1.0:
        raise ValueError("importance must be between 0 and 1")
    return value


def validate_metadata(value: Mapping[str, Any] | None) -> dict[str, Any]:
    if value is None:
        return {}
    if not isinstance(value, Mapping):
        raise ValueError("metadata must be a mapping")
    try:
        # Round-trip ensures JSON compatibility and isolates nested objects.
        encoded = json.dumps(
            dict(value), ensure_ascii=False, allow_nan=False, separators=(",", ":")
        )
        if len(encoded.encode("utf-8")) > 64_000:
            raise ValueError("metadata exceeds 64000 bytes")
        decoded = json.loads(encoded)
    except (TypeError, ValueError, OverflowError) as exc:
        raise ValueError(f"metadata must be JSON serializable: {exc}") from exc
    if not isinstance(decoded, dict):
        raise ValueError("metadata must serialize to an object")
    return decoded


def stable_fingerprint(
    tenant_id: str,
    user_id: str,
    content: str,
    category: str = "general",
) -> str:
    payload = "\x1f".join(
        (
            validate_identifier(tenant_id, "tenant_id"),
            validate_identifier(user_id, "user_id"),
            validate_content(content).casefold(),
            validate_identifier(category, "category").casefold(),
        )
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


@dataclass(frozen=True, slots=True)
class LongTermMemoryRecord:
    memory_id: str
    tenant_id: str
    user_id: str
    content: str
    category: str = "general"
    importance: float = 0.5
    metadata: dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=utc_now)
    updated_at: datetime = field(default_factory=utc_now)
    archived: bool = False
    version: int = 1
    access_count: int = 0
    fingerprint: str = ""

    def __post_init__(self) -> None:
        object.__setattr__(self, "memory_id", validate_identifier(self.memory_id, "memory_id"))
        object.__setattr__(self, "tenant_id", validate_identifier(self.tenant_id, "tenant_id"))
        object.__setattr__(self, "user_id", validate_identifier(self.user_id, "user_id"))
        object.__setattr__(self, "content", validate_content(self.content))
        object.__setattr__(self, "category", validate_identifier(self.category, "category"))
        object.__setattr__(self, "importance", validate_importance(self.importance))
        object.__setattr__(self, "metadata", validate_metadata(self.metadata))
        object.__setattr__(self, "created_at", normalize_datetime(self.created_at, "created_at"))
        object.__setattr__(self, "updated_at", normalize_datetime(self.updated_at, "updated_at"))
        if self.updated_at < self.created_at:
            raise ValueError("updated_at cannot precede created_at")
        if not isinstance(self.archived, bool):
            raise ValueError("archived must be boolean")
        if isinstance(self.version, bool) or not isinstance(self.version, int) or self.version < 1:
            raise ValueError("version must be a positive integer")
        if isinstance(self.access_count, bool) or not isinstance(self.access_count, int) or self.access_count < 0:
            raise ValueError("access_count must be a non-negative integer")
        if self.fingerprint:
            object.__setattr__(self, "fingerprint", validate_identifier(self.fingerprint, "fingerprint"))
        else:
            object.__setattr__(
                self,
                "fingerprint",
                stable_fingerprint(self.tenant_id, self.user_id, self.content, self.category),
            )

    def to_dict(self) -> dict[str, Any]:
        return {
            "memory_id": self.memory_id,
            "tenant_id": self.tenant_id,
            "user_id": self.user_id,
            "content": self.content,
            "category": self.category,
            "importance": self.importance,
            "metadata": validate_metadata(self.metadata),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "archived": self.archived,
            "version": self.version,
            "access_count": self.access_count,
            "fingerprint": self.fingerprint,
        }

    @classmethod
    def from_dict(cls, payload: Mapping[str, Any]) -> "LongTermMemoryRecord":
        if not isinstance(payload, Mapping):
            raise ValueError("record payload must be a mapping")
        data = dict(payload)
        for name in ("created_at", "updated_at"):
            value = data.get(name)
            if isinstance(value, str):
                try:
                    data[name] = datetime.fromisoformat(value)
                except ValueError as exc:
                    raise ValueError(f"invalid {name}") from exc
        return cls(**data)


def new_memory_id() -> str:
    return str(uuid.uuid4())
