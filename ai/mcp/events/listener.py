"""MCP event listener definitions."""

from dataclasses import dataclass
from typing import Any, Callable
from uuid import uuid4


@dataclass(frozen=True)
class MCPEventListener:
    """A handler subscribed to one event name, or all events."""

    handler: Callable[..., Any]
    event_name: str | None = None
    listener_id: str = ""

    def __post_init__(self) -> None:
        if not callable(self.handler):
            raise TypeError("Event handler must be callable.")

        if self.event_name is not None:
            if (
                not isinstance(self.event_name, str)
                or not self.event_name.strip()
            ):
                raise ValueError(
                    "Event name must be a non-empty string or None."
                )
            object.__setattr__(self, "event_name", self.event_name.strip())

        if not self.listener_id:
            object.__setattr__(self, "listener_id", uuid4().hex)
        elif (
            not isinstance(self.listener_id, str)
            or not self.listener_id.strip()
        ):
            raise ValueError("Listener ID must be a non-empty string.")