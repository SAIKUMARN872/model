from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Mapping


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def validate_id(value: str, name: str) -> str:
    if not isinstance(value, str):
        raise ValueError(f"{name} must be a string")
    value = value.strip()
    if not value or len(value) > 200:
        raise ValueError(f"{name} must contain 1-200 characters")
    if any(ord(ch) < 32 for ch in value):
        raise ValueError(f"{name} contains control characters")
    return value


def validate_text(value: str, name: str = "text", max_length: int = 100_000) -> str:
    if not isinstance(value, str):
        raise ValueError(f"{name} must be a string")
    value = value.strip()
    if not value:
        raise ValueError(f"{name} cannot be empty")
    if len(value) > max_length:
        raise ValueError(f"{name} exceeds {max_length} characters")
    return value


def validate_limit(value: int, *, minimum: int = 1, maximum: int = 100) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        raise ValueError("limit must be an integer")
    if not minimum <= value <= maximum:
        raise ValueError(f"limit must be between {minimum} and {maximum}")
    return value


def validate_json_mapping(value: Mapping[str, Any] | None) -> dict[str, Any]:
    if value is None:
        return {}
    if not isinstance(value, Mapping):
        raise ValueError("metadata must be a mapping")
    try:
        encoded = json.dumps(dict(value), allow_nan=False, ensure_ascii=False)
        if len(encoded.encode("utf-8")) > 64_000:
            raise ValueError("metadata exceeds 64000 bytes")
        result = json.loads(encoded)
    except (TypeError, ValueError, OverflowError) as exc:
        raise ValueError(f"metadata must be JSON-safe: {exc}") from exc
    if not isinstance(result, dict):
        raise ValueError("metadata must be a JSON object")
    return result


@dataclass(frozen=True, slots=True)
class MemoryContext:
    tenant_id: str
    user_id: str
    conversation_id: str | None = None
    request_id: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        object.__setattr__(self, "tenant_id", validate_id(self.tenant_id, "tenant_id"))
        object.__setattr__(self, "user_id", validate_id(self.user_id, "user_id"))
        if self.conversation_id is not None:
            object.__setattr__(
                self, "conversation_id",
                validate_id(self.conversation_id, "conversation_id"),
            )
        if self.request_id is not None:
            object.__setattr__(
                self, "request_id", validate_id(self.request_id, "request_id")
            )
        object.__setattr__(self, "metadata", validate_json_mapping(self.metadata))


@dataclass(frozen=True, slots=True)
class MemoryItem:
    memory_id: str
    backend: str
    content: str
    category: str = "general"
    score: float = 0.0
    metadata: dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=utc_now)

    def __post_init__(self) -> None:
        object.__setattr__(self, "memory_id", validate_id(self.memory_id, "memory_id"))
        object.__setattr__(self, "backend", validate_id(self.backend, "backend"))
        object.__setattr__(self, "content", validate_text(self.content, "content"))
        object.__setattr__(self, "category", validate_id(self.category, "category"))
        if isinstance(self.score, bool) or not isinstance(self.score, (int, float)):
            raise ValueError("score must be numeric")
        import math
        if not math.isfinite(float(self.score)) or not 0 <= self.score <= 1:
            raise ValueError("score must be finite and between 0 and 1")
        object.__setattr__(self, "metadata", validate_json_mapping(self.metadata))
        if not isinstance(self.created_at, datetime):
            raise ValueError("created_at must be a datetime")
        if self.created_at.tzinfo is None or self.created_at.utcoffset() is None:
            raise ValueError("created_at must be timezone-aware")
        object.__setattr__(self, "created_at", self.created_at.astimezone(timezone.utc))


@dataclass(frozen=True, slots=True)
class BackendFailure:
    backend: str
    operation: str
    error_type: str
    message: str


@dataclass(frozen=True, slots=True)
class MemoryOperationResult:
    success: bool
    operation: str
    items: tuple[MemoryItem, ...] = ()
    memory_id: str | None = None
    failures: tuple[BackendFailure, ...] = ()
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        object.__setattr__(self, "operation", validate_id(self.operation, "operation"))
        object.__setattr__(self, "items", tuple(self.items))
        object.__setattr__(self, "failures", tuple(self.failures))
        if self.memory_id is not None:
            object.__setattr__(self, "memory_id", validate_id(self.memory_id, "memory_id"))
        object.__setattr__(self, "metadata", validate_json_mapping(self.metadata))
