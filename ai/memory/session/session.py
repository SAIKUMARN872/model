from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Mapping

from .utils import (
    normalize_timestamp,
    validate_identifier,
    validate_metadata,
    validate_session_name,
)


class SessionStatus(str, Enum):
    ACTIVE = "active"
    CLOSED = "closed"
    EXPIRED = "expired"


@dataclass(frozen=True)
class SessionRecord:
    session_id: str
    tenant_id: str
    user_id: str
    name: str
    status: SessionStatus = SessionStatus.ACTIVE
    created_at: datetime = field(default_factory=normalize_timestamp)
    updated_at: datetime = field(default_factory=normalize_timestamp)
    expires_at: datetime | None = None
    version: int = 1
    metadata: Mapping[str, Any] = field(default_factory=dict)
    context: Mapping[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        for field_name in ("session_id", "tenant_id", "user_id"):
            object.__setattr__(
                self,
                field_name,
                validate_identifier(getattr(self, field_name), field_name),
            )

        object.__setattr__(self, "name", validate_session_name(self.name))

        try:
            status = SessionStatus(self.status)
        except (TypeError, ValueError) as exc:
            raise ValueError("invalid session status") from exc
        object.__setattr__(self, "status", status)

        created = normalize_timestamp(self.created_at)
        updated = normalize_timestamp(self.updated_at)
        expires = (
            normalize_timestamp(self.expires_at)
            if self.expires_at is not None
            else None
        )

        if updated < created:
            raise ValueError("updated_at cannot precede created_at")
        if expires is not None and expires <= created:
            raise ValueError("expires_at must follow created_at")
        if isinstance(self.version, bool) or not isinstance(self.version, int) or self.version < 1:
            raise ValueError("version must be a positive integer")
        if not isinstance(self.context, Mapping):
            raise ValueError("context must be a mapping")

        from .utils import validate_context_item

        copied_context = validate_context_item(dict(self.context))
        object.__setattr__(self, "created_at", created)
        object.__setattr__(self, "updated_at", updated)
        object.__setattr__(self, "expires_at", expires)
        object.__setattr__(self, "metadata", validate_metadata(self.metadata))
        object.__setattr__(self, "context", copied_context)

    def is_expired(self, now: datetime | None = None) -> bool:
        if self.status == SessionStatus.EXPIRED:
            return True
        if self.expires_at is None:
            return False
        return normalize_timestamp(now) >= self.expires_at

    def to_dict(self) -> dict[str, Any]:
        return {
            "session_id": self.session_id,
            "tenant_id": self.tenant_id,
            "user_id": self.user_id,
            "name": self.name,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "version": self.version,
            "metadata": validate_metadata(self.metadata),
            "context": dict(self.context),
        }

    @classmethod
    def from_dict(cls, data: Mapping[str, Any]) -> "SessionRecord":
        if not isinstance(data, Mapping):
            raise ValueError("session payload must be a mapping")

        from .utils import parse_timestamp

        payload = dict(data)
        for key in ("created_at", "updated_at", "expires_at"):
            if payload.get(key) is not None:
                payload[key] = parse_timestamp(payload[key])

        return cls(**payload)
