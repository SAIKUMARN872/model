"""Validated MCP event envelopes."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from types import MappingProxyType
from typing import Any, Mapping


@dataclass(frozen=True)
class MCPEvent:
    """Immutable event envelope with a timezone-aware timestamp."""

    name: str
    payload: Mapping[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    metadata: Mapping[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not isinstance(self.name, str) or not self.name.strip():
            raise ValueError("Event name must be a non-empty string.")
        if not isinstance(self.payload, Mapping):
            raise TypeError("Event payload must be a mapping.")
        if not isinstance(self.metadata, Mapping):
            raise TypeError("Event metadata must be a mapping.")
        if not isinstance(self.timestamp, datetime):
            raise TypeError("Event timestamp must be a datetime.")
        if self.timestamp.tzinfo is None or self.timestamp.utcoffset() is None:
            raise ValueError("Event timestamp must be timezone-aware.")

        object.__setattr__(self, "name", self.name.strip())
        object.__setattr__(
            self, "payload", MappingProxyType(dict(self.payload))
        )
        object.__setattr__(
            self, "metadata", MappingProxyType(dict(self.metadata))
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "payload": dict(self.payload),
            "timestamp": self.timestamp.isoformat(),
            "metadata": dict(self.metadata),
        }