"""Validated data models shared by ModelNow memory components."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any
from uuid import uuid4

from .constants import DEFAULT_IMPORTANCE, DEFAULT_MEMORY_LIMIT, MAX_MEMORY_LIMIT
from .exceptions import MemoryValidationError
from .utils import (
    ensure_utc,
    normalize_text,
    utc_now,
    validate_finite_number,
    validate_identifier,
    validate_json_object,
)


class MemoryType(str, Enum):
    SHORT_TERM = "short_term"
    WORKING = "working"
    EPISODIC = "episodic"
    SEMANTIC = "semantic"
    LONG_TERM = "long_term"
    CONVERSATION = "conversation"


class MemoryStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"


@dataclass(slots=True)
class MemoryRecord:
    """A tenant-scoped memory item with explicit lifecycle metadata."""

    tenant_id: str
    user_id: str
    content: str
    memory_id: str = field(default_factory=lambda: str(uuid4()))
    memory_type: MemoryType = MemoryType.LONG_TERM
    created_at: datetime = field(default_factory=utc_now)
    updated_at: datetime = field(default_factory=utc_now)
    expires_at: datetime | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    importance: float = DEFAULT_IMPORTANCE
    access_count: int = 0
    last_accessed_at: datetime | None = None
    version: int = 1
    status: MemoryStatus = MemoryStatus.ACTIVE

    def __post_init__(self) -> None:
        self.tenant_id = validate_identifier(self.tenant_id, field="tenant_id")
        self.user_id = validate_identifier(self.user_id, field="user_id")
        self.memory_id = validate_identifier(self.memory_id, field="memory_id")
        self.content = normalize_text(self.content, field="content")

        try:
            self.memory_type = MemoryType(self.memory_type)
            self.status = MemoryStatus(self.status)
        except ValueError as exc:
            raise MemoryValidationError("Unsupported memory type or status") from exc

        self.created_at = ensure_utc(self.created_at, field="created_at")
        self.updated_at = ensure_utc(self.updated_at, field="updated_at")
        self.expires_at = ensure_utc(self.expires_at, field="expires_at")
        self.last_accessed_at = ensure_utc(
            self.last_accessed_at, field="last_accessed_at"
        )

        if self.updated_at < self.created_at:
            raise MemoryValidationError("updated_at cannot precede created_at")
        if self.expires_at is not None and self.expires_at <= self.created_at:
            raise MemoryValidationError("expires_at must be later than created_at")

        self.importance = validate_finite_number(self.importance, field="importance")
        if not 0.0 <= self.importance <= 1.0:
            raise MemoryValidationError("importance must be between 0 and 1")

        if isinstance(self.access_count, bool) or not isinstance(self.access_count, int):
            raise MemoryValidationError("access_count must be an integer")
        if self.access_count < 0:
            raise MemoryValidationError("access_count cannot be negative")

        if isinstance(self.version, bool) or not isinstance(self.version, int) or self.version < 1:
            raise MemoryValidationError("version must be a positive integer")

        self.metadata = validate_json_object(self.metadata)

    def is_expired(self, *, at: datetime | None = None) -> bool:
        """Return whether this record has passed its expiration time."""
        if self.expires_at is None:
            return False
        now = ensure_utc(at or utc_now(), field="at")
        return self.expires_at <= now

    def to_dict(self) -> dict[str, Any]:
        """Return a JSON-compatible representation."""
        return {
            "schema_version": 1,
            "memory_id": self.memory_id,
            "tenant_id": self.tenant_id,
            "user_id": self.user_id,
            "content": self.content,
            "memory_type": self.memory_type.value,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "metadata": self.metadata.copy(),
            "importance": self.importance,
            "access_count": self.access_count,
            "last_accessed_at": (
                self.last_accessed_at.isoformat() if self.last_accessed_at else None
            ),
            "version": self.version,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "MemoryRecord":
        """Construct a validated record from a serialized mapping."""
        if not isinstance(data, dict):
            raise MemoryValidationError("record data must be a dictionary")

        fields = {
            key: value
            for key, value in data.items()
            if key in {
                "tenant_id", "user_id", "content", "memory_id", "memory_type",
                "created_at", "updated_at", "expires_at", "metadata", "importance",
                "access_count", "last_accessed_at", "version", "status",
            }
        }
        required = {"tenant_id", "user_id", "content"}
        missing = required - fields.keys()
        if missing:
            raise MemoryValidationError(f"Missing required fields: {', '.join(sorted(missing))}")
        return cls(**fields)


@dataclass(slots=True)
class MemoryQuery:
    """A bounded search request; tenant scope is always mandatory."""

    tenant_id: str
    user_id: str | None = None
    query: str | None = None
    memory_types: tuple[MemoryType, ...] = ()
    limit: int = DEFAULT_MEMORY_LIMIT
    created_after: datetime | None = None
    created_before: datetime | None = None
    include_expired: bool = False
    metadata_filters: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        self.tenant_id = validate_identifier(self.tenant_id, field="tenant_id")
        if self.user_id is not None:
            self.user_id = validate_identifier(self.user_id, field="user_id")
        if self.query is not None:
            self.query = normalize_text(self.query, field="query", max_chars=20_000)

        if isinstance(self.limit, bool) or not isinstance(self.limit, int):
            raise MemoryValidationError("limit must be an integer")
        if not 1 <= self.limit <= MAX_MEMORY_LIMIT:
            raise MemoryValidationError(f"limit must be between 1 and {MAX_MEMORY_LIMIT}")

        try:
            self.memory_types = tuple(MemoryType(item) for item in self.memory_types)
        except (TypeError, ValueError) as exc:
            raise MemoryValidationError("memory_types contains an unsupported type") from exc

        self.created_after = ensure_utc(self.created_after, field="created_after")
        self.created_before = ensure_utc(self.created_before, field="created_before")
        if (
            self.created_after is not None
            and self.created_before is not None
            and self.created_after > self.created_before
        ):
            raise MemoryValidationError("created_after cannot be later than created_before")

        if not isinstance(self.include_expired, bool):
            raise MemoryValidationError("include_expired must be a boolean")
        self.metadata_filters = validate_json_object(
            self.metadata_filters, field="metadata_filters"
        )


@dataclass(frozen=True, slots=True)
class MemorySearchResult:
    """A retrieved record and its backend-provided relevance score."""

    record: MemoryRecord
    score: float
    source: str = "memory"

    def __post_init__(self) -> None:
        if not isinstance(self.record, MemoryRecord):
            raise MemoryValidationError("record must be a MemoryRecord")
        score = validate_finite_number(self.score, field="score")
        object.__setattr__(self, "score", score)
        object.__setattr__(
            self, "source", validate_identifier(self.source, field="source")
        )


@dataclass(frozen=True, slots=True)
class MemoryStats:
    """Backend-neutral operational counters."""

    total_records: int
    active_records: int
    expired_records: int = 0

    def __post_init__(self) -> None:
        for name in ("total_records", "active_records", "expired_records"):
            value = getattr(self, name)
            if isinstance(value, bool) or not isinstance(value, int) or value < 0:
                raise MemoryValidationError(f"{name} must be a non-negative integer")
        if self.active_records > self.total_records:
            raise MemoryValidationError("active_records cannot exceed total_records")
