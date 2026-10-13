from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta

from .utils import (
    utc_now,
    validate_metadata,
    validate_positive_int,
    validate_state,
)


@dataclass(frozen=True, slots=True)
class WorkingMemoryState:
    context: object
    data: dict = field(default_factory=dict)
    version: int = 1
    created_at: datetime = field(default_factory=utc_now)
    updated_at: datetime = field(default_factory=utc_now)
    expires_at: datetime | None = None
    metadata: dict = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not hasattr(self.context, "scope_key"):
            raise ValueError("context must be a WorkingMemoryContext")
        object.__setattr__(self, "data", validate_state(self.data))
        object.__setattr__(
            self, "version", validate_positive_int(self.version, "version", 2**31 - 1)
        )
        object.__setattr__(self, "metadata", validate_metadata(self.metadata))
        for field_name in ("created_at", "updated_at", "expires_at"):
            value = getattr(self, field_name)
            if value is not None:
                if not isinstance(value, datetime) or value.tzinfo is None:
                    raise ValueError(f"{field_name} must be timezone-aware")
                if value.utcoffset() is None:
                    raise ValueError(f"{field_name} must be timezone-aware")

    @property
    def is_expired(self) -> bool:
        return self.expires_at is not None and self.expires_at <= utc_now()

    def to_dict(self) -> dict:
        return {
            "tenant_id": self.context.tenant_id,
            "user_id": self.context.user_id,
            "conversation_id": self.context.conversation_id,
            "task_id": self.context.task_id,
            "data": validate_state(self.data),
            "version": self.version,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "metadata": validate_metadata(self.metadata),
        }

    @classmethod
    def from_dict(cls, payload: dict) -> "WorkingMemoryState":
        from .context import WorkingMemoryContext

        if not isinstance(payload, dict):
            raise ValueError("payload must be a dictionary")
        context = WorkingMemoryContext(
            tenant_id=payload["tenant_id"],
            user_id=payload["user_id"],
            conversation_id=payload.get("conversation_id"),
            task_id=payload.get("task_id"),
        )

        def parse_datetime(value):
            if value is None:
                return None
            if not isinstance(value, str):
                raise ValueError("datetime values must be ISO-formatted strings")
            parsed = datetime.fromisoformat(value)
            if parsed.tzinfo is None or parsed.utcoffset() is None:
                raise ValueError("datetime values must be timezone-aware")
            return parsed

        return cls(
            context=context,
            data=payload.get("data", {}),
            version=payload.get("version", 1),
            created_at=parse_datetime(payload["created_at"]),
            updated_at=parse_datetime(payload["updated_at"]),
            expires_at=parse_datetime(payload.get("expires_at")),
            metadata=payload.get("metadata", {}),
        )
