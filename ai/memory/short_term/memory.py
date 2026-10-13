from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any, Mapping

from .utils import (
    normalize_timestamp,
    validate_content,
    validate_identifier,
    validate_metadata,
)


@dataclass(frozen=True)
class ShortTermMemory:
    memory_id: str
    tenant_id: str
    user_id: str
    content: str
    category: str = "conversation"
    created_at: datetime = field(default_factory=normalize_timestamp)
    expires_at: datetime | None = None
    metadata: Mapping[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        for name in ("memory_id", "tenant_id", "user_id", "category"):
            object.__setattr__(
                self, name, validate_identifier(getattr(self, name), name)
            )

        object.__setattr__(self, "content", validate_content(self.content))

        created = normalize_timestamp(self.created_at)
        expires = (
            normalize_timestamp(self.expires_at)
            if self.expires_at is not None
            else None
        )
        if expires is not None and expires <= created:
            raise ValueError("expires_at must be after created_at")

        object.__setattr__(self, "created_at", created)
        object.__setattr__(self, "expires_at", expires)
        object.__setattr__(self, "metadata", validate_metadata(self.metadata))

    def is_expired(self, now: datetime | None = None) -> bool:
        if self.expires_at is None:
            return False
        return normalize_timestamp(now) >= self.expires_at

    def to_dict(self) -> dict[str, Any]:
        return {
            "memory_id": self.memory_id,
            "tenant_id": self.tenant_id,
            "user_id": self.user_id,
            "content": self.content,
            "category": self.category,
            "created_at": self.created_at.isoformat(),
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "metadata": dict(self.metadata),
        }

    @classmethod
    def from_dict(cls, data: Mapping[str, Any]) -> "ShortTermMemory":
        if not isinstance(data, Mapping):
            raise ValueError("memory payload must be a mapping")

        from datetime import datetime

        payload = dict(data)
        for name in ("created_at", "expires_at"):
            if payload.get(name) is not None:
                value = payload[name]
                if not isinstance(value, str):
                    raise ValueError(f"{name} must be an ISO-8601 string")
                try:
                    payload[name] = datetime.fromisoformat(
                        value.replace("Z", "+00:00")
                    )
                except ValueError as exc:
                    raise ValueError(f"invalid {name}") from exc

        return cls(**payload)
