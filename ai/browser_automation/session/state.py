"""
Session state management.

Stores the current lifecycle state of an AI session.
"""

from __future__ import annotations

from enum import Enum


class SessionState(str, Enum):
    """Lifecycle states for an AI session."""

    CREATED = "created"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


TERMINAL_STATES = {
    SessionState.COMPLETED,
    SessionState.FAILED,
    SessionState.CANCELLED,
}


def is_terminal(
    state: SessionState,
) -> bool:
    """Return True when the session cannot continue."""

    return state in TERMINAL_STATES


def can_activate(
    state: SessionState,
) -> bool:
    """Check whether a session can become active."""

    return state in {
        SessionState.CREATED,
        SessionState.PAUSED,
    }