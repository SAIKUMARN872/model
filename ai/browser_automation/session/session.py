from copy import deepcopy
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

from .state import SessionState
from .utils import utc_now, validate_identifier


@dataclass
class ManagedSession:
    """Application-level browser session metadata, not a browser handle."""

    session_id: str
    user_id: str
    task_id: str
    state: SessionState
    created_at: datetime
    updated_at: datetime
    expires_at: datetime
    metadata: dict[str, Any] = field(default_factory=dict)
    version: int = 0

    def __post_init__(self) -> None:
        self.session_id = validate_identifier(self.session_id, "session_id")
        self.user_id = validate_identifier(self.user_id, "user_id")
        self.task_id = validate_identifier(self.task_id, "task_id")

        if not isinstance(self.state, SessionState):
            self.state = SessionState(self.state)

        for name in ("created_at", "updated_at", "expires_at"):
            value = getattr(self, name)
            if not isinstance(value, datetime) or value.utcoffset() is None:
                raise ValueError(f"{name} must be a timezone-aware datetime.")

        if self.expires_at <= self.created_at:
            raise ValueError("Session expiration must be after creation.")

        if not isinstance(self.metadata, dict):
            raise ValueError("Session metadata must be a dictionary.")

        self.metadata = deepcopy(self.metadata)

        if isinstance(self.version, bool) or not isinstance(self.version, int):
            raise ValueError("Session version must be a non-negative integer.")
        if self.version < 0:
            raise ValueError("Session version must be a non-negative integer.")

    def snapshot(self) -> "ManagedSession":
        """Return a detached copy so callers cannot mutate stored state."""
        return deepcopy(self)

    def to_dict(self) -> dict[str, Any]:
        """Return a serialization-friendly representation."""
        return {
            "session_id": self.session_id,
            "user_id": self.user_id,
            "task_id": self.task_id,
            "state": self.state.value,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "expires_at": self.expires_at.isoformat(),
            "metadata": deepcopy(self.metadata),
            "version": self.version,
        }
