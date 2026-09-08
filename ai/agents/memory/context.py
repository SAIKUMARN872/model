"""
Runtime context for ModelNow memory.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


@dataclass
class MemoryContext:
    """
    Context supplied to an agent during execution.
    """

    user_id: str | None = None
    session_id: str | None = None
    conversation_id: str | None = None

    current_input: str = ""

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    memories: list[dict[str, Any]] = field(
        default_factory=list
    )

    history: list[dict[str, Any]] = field(
        default_factory=list
    )

    created_at: datetime = field(
        default_factory=lambda: datetime.now(
            timezone.utc
        )
    )

    def set(
        self,
        key: str,
        value: Any,
    ) -> None:
        """Store context metadata."""

        if not key:
            raise ValueError(
                "Context key cannot be empty"
            )

        self.metadata[key] = value

    def get(
        self,
        key: str,
        default: Any = None,
    ) -> Any:
        """Retrieve context metadata."""

        return self.metadata.get(
            key,
            default,
        )

    def has(
        self,
        key: str,
    ) -> bool:
        """Check whether metadata exists."""

        return key in self.metadata

    def add_memory(
        self,
        memory: dict[str, Any],
    ) -> None:
        """Add a retrieved memory."""

        if not isinstance(
            memory,
            dict,
        ):
            raise TypeError(
                "memory must be a dictionary"
            )

        self.memories.append(
            memory
        )

    def add_history(
        self,
        message: dict[str, Any],
    ) -> None:
        """Add a history item."""

        if not isinstance(
            message,
            dict,
        ):
            raise TypeError(
                "message must be a dictionary"
            )

        self.history.append(
            message
        )

    def clear_memories(self) -> None:
        """Clear retrieved memories."""

        self.memories.clear()

    def clear_history(self) -> None:
        """Clear history stored in this context."""

        self.history.clear()

    def to_dict(self) -> dict[str, Any]:
        """Serialize context."""

        return {
            "user_id": self.user_id,
            "session_id": self.session_id,
            "conversation_id": self.conversation_id,
            "current_input": self.current_input,
            "metadata": dict(self.metadata),
            "memories": list(self.memories),
            "history": list(self.history),
            "created_at": self.created_at.isoformat(),
        }