"""
AI session implementation.

A session represents one continuous interaction/workflow
between the AI system, user and browser/agent components.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from .state import (
    SessionState,
    can_activate,
    is_terminal,
)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


@dataclass
class SessionEvent:
    """Represents an event inside a session."""

    event_type: str

    data: dict[str, Any] = field(
        default_factory=dict
    )

    timestamp: datetime = field(
        default_factory=utc_now
    )

    def to_dict(self) -> dict[str, Any]:

        return {
            "event_type": self.event_type,
            "data": self.data,
            "timestamp": self.timestamp.isoformat(),
        }


@dataclass
class Session:
    """
    Represents an AI execution session.
    """

    session_id: str = field(
        default_factory=lambda:
        f"session_{uuid4().hex}"
    )

    user_id: str | None = None

    state: SessionState = (
        SessionState.CREATED
    )

    metadata: dict[str, Any] = field(
        default_factory=dict
    )

    context: dict[str, Any] = field(
        default_factory=dict
    )

    events: list[SessionEvent] = field(
        default_factory=list
    )

    created_at: datetime = field(
        default_factory=utc_now
    )

    updated_at: datetime = field(
        default_factory=utc_now
    )

    started_at: datetime | None = None

    completed_at: datetime | None = None

    error: str | None = None

    def _touch(self) -> None:

        self.updated_at = utc_now()

    def add_event(
        self,
        event_type: str,
        **data: Any,
    ) -> SessionEvent:

        if not event_type.strip():

            raise ValueError(
                "event_type cannot be empty."
            )

        event = SessionEvent(
            event_type=event_type,
            data=data,
        )

        self.events.append(
            event
        )

        self._touch()

        return event

    def set_context(
        self,
        key: str,
        value: Any,
    ) -> None:

        if not key.strip():

            raise ValueError(
                "Context key cannot be empty."
            )

        self.context[key] = value

        self._touch()

    def get_context(
        self,
        key: str,
        default: Any = None,
    ) -> Any:

        return self.context.get(
            key,
            default,
        )

    def update_context(
        self,
        values: dict[str, Any],
    ) -> None:

        if not isinstance(
            values,
            dict,
        ):

            raise TypeError(
                "values must be a dictionary."
            )

        self.context.update(
            values
        )

        self._touch()

    def activate(self) -> None:

        if not can_activate(
            self.state
        ):

            raise ValueError(
                f"Session cannot be activated "
                f"from state '{self.state.value}'."
            )

        self.state = SessionState.ACTIVE

        if self.started_at is None:

            self.started_at = utc_now()

        self.add_event(
            "session_activated"
        )

    def pause(self) -> None:

        if self.state != SessionState.ACTIVE:

            raise ValueError(
                "Only active sessions can be paused."
            )

        self.state = SessionState.PAUSED

        self.add_event(
            "session_paused"
        )

    def complete(
        self,
        result: Any = None,
    ) -> None:

        if is_terminal(
            self.state
        ):

            raise ValueError(
                "Session is already in a terminal state."
            )

        self.state = SessionState.COMPLETED

        self.completed_at = utc_now()

        if result is not None:

            self.context[
                "result"
            ] = result

        self.add_event(
            "session_completed"
        )

    def fail(
        self,
        error: str,
    ) -> None:

        if is_terminal(
            self.state
        ):

            return

        self.state = SessionState.FAILED

        self.error = str(
            error
        )

        self.completed_at = utc_now()

        self.add_event(
            "session_failed",
            error=self.error,
        )

    def cancel(
        self,
        reason: str | None = None,
    ) -> None:

        if is_terminal(
            self.state
        ):

            return

        self.state = SessionState.CANCELLED

        self.completed_at = utc_now()

        self.add_event(
            "session_cancelled",
            reason=reason,
        )

    @property
    def active(self) -> bool:

        return self.state == SessionState.ACTIVE

    @property
    def terminal(self) -> bool:

        return is_terminal(
            self.state
        )

    def to_dict(
        self,
    ) -> dict[str, Any]:

        return {
            "session_id": self.session_id,
            "user_id": self.user_id,
            "state": self.state.value,
            "metadata": self.metadata,
            "context": self.context,
            "events": [
                event.to_dict()
                for event in self.events
            ],
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "started_at": (
                self.started_at.isoformat()
                if self.started_at
                else None
            ),
            "completed_at": (
                self.completed_at.isoformat()
                if self.completed_at
                else None
            ),
            "error": self.error,
        }