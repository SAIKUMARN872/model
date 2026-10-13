"""Utilities for creating and serializing MCP events."""

from collections.abc import Mapping
from datetime import datetime
from typing import Any

from .events import MCPEvent


def validate_event_name(name: Any) -> str:
    """Return a normalized event name or raise ValueError."""
    if not isinstance(name, str) or not name.strip():
        raise ValueError("Event name must be a non-empty string.")
    return name.strip()


def event_to_dict(event: MCPEvent) -> dict[str, Any]:
    """Convert an MCP event to a JSON-friendly dictionary."""
    if not isinstance(event, MCPEvent):
        raise TypeError("event must be an MCPEvent.")
    return event.to_dict()


def event_from_dict(data: Mapping[str, Any]) -> MCPEvent:
    """Build an event from a mapping, including an optional ISO timestamp."""
    if not isinstance(data, Mapping):
        raise TypeError("Event data must be a mapping.")

    timestamp = data.get("timestamp")
    if isinstance(timestamp, str):
        try:
            timestamp = datetime.fromisoformat(timestamp)
        except ValueError as exc:
            raise ValueError("Invalid event timestamp.") from exc

    payload = data.get("payload", {})
    metadata = data.get("metadata", {})
    if not isinstance(payload, Mapping):
        raise TypeError("Event payload must be a mapping.")
    if not isinstance(metadata, Mapping):
        raise TypeError("Event metadata must be a mapping.")

    kwargs = {
        "name": validate_event_name(data.get("name")),
        "payload": dict(payload),
        "metadata": dict(metadata),
    }
    if timestamp is not None:
        kwargs["timestamp"] = timestamp
    return MCPEvent(**kwargs)
