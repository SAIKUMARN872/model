from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class SessionContext:
    """Store mutable context associated with an inference session."""

    session_id: str
    model: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)

    def update(
        self,
        *,
        model: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        if model is not None:
            self.model = model

        if metadata is not None:
            self.metadata.update(metadata)

    def clear(self) -> None:
        self.model = None
        self.metadata.clear()


__all__ = ["SessionContext"]
