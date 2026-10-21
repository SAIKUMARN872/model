"""Context information for an agent's memory operations."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .utils import copy_metadata, validate_text


@dataclass
class MemoryContext:
    user_id: str | None = None
    session_id: str | None = None
    conversation_id: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        for name in ("user_id", "session_id", "conversation_id"):
            value = getattr(self, name)
            if value is not None:
                setattr(self, name, validate_text(value, name))
        self.metadata = copy_metadata(self.metadata)

    def scope_key(self) -> tuple[str | None, str | None, str | None]:
        """Return the identifiers that isolate this context."""
        return self.user_id, self.session_id, self.conversation_id

    @classmethod
    def from_agent_context(cls, context: Any) -> "MemoryContext":
        """Adapt the existing AgentContext without coupling memory to it."""
        if context is None:
            return cls()
        return cls(
            user_id=getattr(context, "user_id", None),
            session_id=getattr(context, "session_id", None),
            conversation_id=getattr(context, "conversation_id", None),
            metadata=getattr(context, "metadata", {}) or {},
        )
