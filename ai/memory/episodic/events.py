"""Immutable episodic event model."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Mapping
from uuid import uuid4

from ai.memory.exceptions import MemoryValidationError
from ai.memory.episodic.utils import (
    normalize_content, normalize_datetime, normalize_event_type,
    validate_identifier, validate_metadata, validate_score,
)


@dataclass(frozen=True, slots=True)
class EpisodicEvent:
    tenant_id: str
    user_id: str
    event_type: str
    content: str
    occurred_at: datetime | None = None
    event_id: str = field(default_factory=lambda: str(uuid4()))
    importance: float = 0.5
    metadata: Mapping[str, Any] = field(default_factory=dict)
    correlation_id: str | None = None
    source: str | None = None

    def __post_init__(self) -> None:
        for name in ("tenant_id", "user_id", "event_id"):
            object.__setattr__(
                self, name, validate_identifier(getattr(self, name), name)
            )
        object.__setattr__(self, "event_type", normalize_event_type(self.event_type))
        object.__setattr__(self, "content", normalize_content(self.content))
        object.__setattr__(self, "occurred_at", normalize_datetime(self.occurred_at))
        object.__setattr__(self, "importance", validate_score(self.importance))
        object.__setattr__(self, "metadata", validate_metadata(self.metadata))
        for name in ("correlation_id", "source"):
            value = getattr(self, name)
            if value is not None:
                object.__setattr__(self, name, validate_identifier(value, name))

    def to_dict(self) -> dict[str, Any]:
        return {
            "event_id": self.event_id,
            "tenant_id": self.tenant_id,
            "user_id": self.user_id,
            "event_type": self.event_type,
            "content": self.content,
            "occurred_at": self.occurred_at.isoformat(),
            "importance": self.importance,
            "metadata": dict(self.metadata),
            "correlation_id": self.correlation_id,
            "source": self.source,
        }

    @classmethod
    def from_dict(cls, data: Mapping[str, Any]) -> "EpisodicEvent":
        if not isinstance(data, Mapping):
            raise MemoryValidationError("event payload must be a mapping")
        payload = dict(data)
        timestamp = payload.get("occurred_at")
        if isinstance(timestamp, str):
            try:
                payload["occurred_at"] = datetime.fromisoformat(
                    timestamp.replace("Z", "+00:00")
                )
            except ValueError as exc:
                raise MemoryValidationError("occurred_at is invalid") from exc
        allowed = {
            "event_id", "tenant_id", "user_id", "event_type", "content",
            "occurred_at", "importance", "metadata", "correlation_id", "source",
        }
        unknown = set(payload) - allowed
        if unknown:
            raise MemoryValidationError(
                f"unknown fields: {', '.join(sorted(unknown))}"
            )
        try:
            return cls(**payload)
        except TypeError as exc:
            raise MemoryValidationError("event payload is incomplete") from exc
