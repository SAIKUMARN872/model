"""
AI session package.
"""

from .manager import (
    SessionManager,
)

from .session import (
    Session,
    SessionEvent,
)

from .state import (
    SessionState,
    TERMINAL_STATES,
    can_activate,
    is_terminal,
)

from .utils import (
    merge_context,
    safe_session_id,
    serialize_datetime,
    session_duration_seconds,
    utc_now,
)


__all__ = [
    "Session",
    "SessionEvent",
    "SessionManager",
    "SessionState",
    "TERMINAL_STATES",
    "can_activate",
    "is_terminal",
    "merge_context",
    "safe_session_id",
    "serialize_datetime",
    "session_duration_seconds",
    "utc_now",
]


__version__ = "1.0.0"